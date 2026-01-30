import fs from 'fs/promises';
import path, { join } from 'path';

import { ASSET_PATH } from 'src/constants/assets-path';

type File = { name: string; path: string; content: Buffer };

const getAllFiles = async (
  rootDir: string,
  dir: string = rootDir,
  files: File[] = [],
): Promise<File[]> => {
  const dirEntries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of dirEntries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await getAllFiles(rootDir, fullPath, files)));
    } else {
      files.push({
        path: path.relative(rootDir, dir),
        name: entry.name,
        content: await fs.readFile(fullPath),
      });
    }
  }

  return files;
};

export const getSeedProjectFiles = (async () => {
  const seedProjectPath = join(
    ASSET_PATH,
    `engine/core-modules/logic-function-executor/drivers/constants/seed-project`,
  );

  return await getAllFiles(seedProjectPath);
})();
