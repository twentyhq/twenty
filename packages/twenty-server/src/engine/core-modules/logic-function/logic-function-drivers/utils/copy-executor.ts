import { promises as fs } from 'fs';
import { resolve, join } from 'path';

import { ASSET_PATH } from 'src/constants/assets-path';

const EXECUTOR_FILE_PATH = resolve(
  __dirname,
  join(
    ASSET_PATH,
    `engine/core-modules/logic-function/logic-function-drivers/constants/executor`,
  ),
);

export const copyExecutor = async (buildDirectory: string) => {
  await fs.mkdir(buildDirectory, {
    recursive: true,
  });
  await fs.cp(EXECUTOR_FILE_PATH, buildDirectory, {
    recursive: true,
  });
};
