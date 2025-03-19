import fs from 'fs';
import { join } from 'path';

function renameJsToCjs(directory: string) {
  try {
    const files = fs.readdirSync(directory, {
      recursive: true,
      withFileTypes: true,
    });

    for (const file of files) {
      if (!file.isFile()) {
        continue;
      }

      const fullPath = join(file.path, file.name);

      if (file.name.endsWith('.js') || file.name.endsWith('.js.map')) {
        const newPath = fullPath.replace(/\.js(\.map)?$/, '.cjs$1');
        fs.renameSync(fullPath, newPath);
      }
    }
  } catch (error) {
    console.error('Error renaming files:', error);
  }
}

// Usage: provide the directory as a command line argument
const directory = process.argv[2];
if (!directory) {
  console.error('Please provide a directory path');
  process.exit(1);
}

renameJsToCjs(directory);
