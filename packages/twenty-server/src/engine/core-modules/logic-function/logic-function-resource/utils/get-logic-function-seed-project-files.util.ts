import fs from 'fs/promises';
import path from 'path';

import { ASSET_PATH } from 'src/constants/assets-path';

export type LogicFunctionSeedProjectFile = {
  name: string;
  path: string;
  content: Buffer;
};

const getAllFiles = async (
  rootDir: string,
  dir: string = rootDir,
  files: LogicFunctionSeedProjectFile[] = [],
): Promise<LogicFunctionSeedProjectFile[]> => {
  const dirEntries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of dirEntries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      await getAllFiles(rootDir, fullPath, files);
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

export const getLogicFunctionSeedProjectFiles = async (): Promise<
  LogicFunctionSeedProjectFile[]
> => {
  const seedProjectPath = path.join(
    ASSET_PATH,
    'engine/core-modules/logic-function/logic-function-resource/constants/seed-project',
  );

  return getAllFiles(seedProjectPath);
};
