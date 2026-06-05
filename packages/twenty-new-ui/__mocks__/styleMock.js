// Proxy so `styles.anyClassName` resolves to its key when SCSS is imported in Jest.
module.exports = new Proxy(
  {},
  {
    get: (_target, key) => (key === '__esModule' ? false : String(key)),
  },
);
