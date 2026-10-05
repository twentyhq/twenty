import fs from 'node:fs';
import path from 'node:path';

const writeFixtureFile = (root, relativePath, contents) => {
  const absolutePath = path.join(root, relativePath);

  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, contents);
};

export { writeFixtureFile };
