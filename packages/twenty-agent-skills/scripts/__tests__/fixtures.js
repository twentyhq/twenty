const fs = require('node:fs');
const path = require('node:path');

const writeFixtureFile = (root, relativePath, contents) => {
  const absolutePath = path.join(root, relativePath);

  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, contents);
};

module.exports = { writeFixtureFile };
