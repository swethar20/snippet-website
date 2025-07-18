// const express = require('express');
// const router = express.Router();
// const mysql = require('mysql2/promise');

// // ✅ Update credentials here
// const pool = mysql.createPool({
//   host: 'localhost',
//   user: 'root',
//   password: 'swethar@2003', // change this
//   database: 'snitch_store',
// });

// router.get('/landing', async (req, res) => {
//   try {
//     const [products] = await pool.query(`
//       SELECT 
//         p.PID, p.Name, p.Price, p.Brand, p.ReviewSummary, pd.Images
//       FROM products p
//       JOIN product_details pd ON p.PID = pd.PDID
//       ORDER BY p.CreatedAt DESC
//       LIMIT 12
//     `);
//     res.json(products);
//   } catch (err) {
//     console.error('❌ SQL Error:', err); // FULL error
//     res.status(500).json({ message: 'Failed to fetch products' });
//   }
// });

// router.get('/reviews', async (req, res) => {
//   try {
//     const [reviews] = await pool.query(`
//       SELECT name, review 
//       FROM reviews
//       ORDER BY created_at DESC
//       LIMIT 6
//     `);
//     res.json(reviews);
//   } catch (err) {
//     console.error('❌ SQL Error (reviews):', err);
//     res.status(500).json({ message: 'Failed to fetch reviews' });
//   }
// });
// module.exports = router;




// backend/Controller/Landingpagecontroller.js
// const express = require('express');
// const router = express.Router();
// const mysql = require('mysql2/promise');

// // DB connection
// const pool = mysql.createPool({
//   host: 'localhost',
//   user: 'root',
//   password: 'swethar@2003',
//   database: 'snitch_store',
// });

// // ✅ PRODUCTS route// Instead of '/landing', use:
// router.get('/products/landing', async (req, res) => {
//   const [products] = await pool.query(`
//     SELECT p.PID, p.Name, p.Price, p.Brand, p.ReviewSummary, pd.Images, pd.Description, p.Category
//     FROM products p
//     JOIN product_details pd ON p.PID = pd.PID
//     ORDER BY p.PID DESC
//     LIMIT 12
//   `);
//   res.json(products);
// });

// router.get('/products/reviews', async (req, res) => {
//   const [reviews] = await pool.query(`
//     SELECT u.FirstName, r.Comment
//     FROM reviews r
//     JOIN users u ON r.UID = u.UID
//     ORDER BY r.RID DESC
//     LIMIT 6
//   `);
//   res.json(reviews);
// });

// module.exports = router;



// const express = require('express');
// const router = express.Router();
// const mysql = require('mysql2/promise');

// // ✅ DB connection
// const pool = mysql.createPool({
//   host: 'localhost',
//   user: 'root',
//   password: 'swethar@2003',
//   database: 'snitch_store',
// });

// // ✅ Fetch 12 latest products
// router.get('/landing', async (req, res) => {
//   try {
//     const [products] = await pool.query(`
//       SELECT p.PID, p.Name, p.Price, p.Brand, p.ReviewSummary, pd.Images, pd.Description, p.Category
//       FROM products p
//       JOIN product_details pd ON p.PID = pd.PID
//       ORDER BY p.PID DESC
//       LIMIT 12
//     `);
//     res.json(products);
//   } catch (err) {
//     console.error('❌ Error fetching products:', err);
//     res.status(500).json({ message: 'Error fetching products' });
//   }
// });

// // ✅ Fetch latest 6 reviews
// router.get('/reviews', async (req, res) => {
//   try {
//     const [reviews] = await pool.query(`
//       SELECT u.FirstName AS name, r.Comment AS review
//       FROM reviews r
//       JOIN users u ON r.UID = u.UID
//       ORDER BY r.RID DESC
//       LIMIT 6
//     `);
//     res.json(reviews);
//   } catch (err) {
//     console.error('❌ Error fetching reviews:', err);
//     res.status(500).json({ message: 'Error fetching reviews' });
//   }
// });

// module.exports = router;



const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');

// ✅ DB connection
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'swethar@2003',
  database: 'snitch_store',
});

// ✅ Helper to get first image
const extractFirstImage = (imageData) => {
  try {
    const parsed = JSON.parse(imageData);
    return Array.isArray(parsed) ? parsed[0] : parsed;
  } catch {
    if (imageData?.includes(',')) {
      return imageData.split(',')[0];
    }
    return imageData;
  }
};

// ✅ Fetch 12 latest products
router.get('/landing', async (req, res) => {
  try {
    const [products] = await pool.query(`
      SELECT p.PID, p.Name, p.Price, p.Brand, p.ReviewSummary, pd.Images, pd.Description, p.Category
      FROM products p
      JOIN product_details pd ON p.PID = pd.PID
      ORDER BY p.PID DESC
      LIMIT 12
    `);

    const formatted = products.map(p => ({
      ...p,
      Images: extractFirstImage(p.Images)
    }));

    res.json(formatted);
  } catch (err) {
    console.error('❌ Error fetching products:', err);
    res.status(500).json({ message: 'Error fetching products' });
  }
});
router.get('/reviews', async (req, res) => {
  try {
    const [reviews] = await pool.query(`
      SELECT u.FirstName AS name, r.Comment AS review
      FROM reviews r
      JOIN users u ON r.UID = u.UID
      ORDER BY r.ReviewID DESC
      LIMIT 6
    `);
    res.json(reviews);
  } catch (err) {
    console.error('❌ Error fetching reviews:', err);
    res.status(500).json({ message: 'Error fetching reviews' });
  }
});

// ✅ Fetch products by category
router.get('/category/:category', async (req, res) => {
  const category = req.params.category;

  try {
    const [results] = await pool.query(`
      SELECT p.PID, p.Name, p.Price, p.Category, p.Brand, pd.Images 
      FROM products p
      LEFT JOIN product_details pd ON p.PID = pd.PID
      WHERE LOWER(REPLACE(p.Category, ' ', '')) = ?
      ORDER BY p.CreatedAt DESC
    `, [category.toLowerCase().replace(/\s/g, '')]);

    const parsed = results.map(row => ({
      ...row,
      Images: extractFirstImage(row.Images)
    }));

    res.json(parsed);
  } catch (err) {
    console.error("❌ Error fetching category:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

