import { promises as fs } from 'fs';
import { resolve, join } from 'path';

import { ASSET_PATH } from 'src/constants/assets-path';

const BUILDER_FILE_PATH = resolve(
  __dirname,
  join(
    ASSET_PATH,
    'engine/core-modules/logic-function/logic-function-drivers/constants/builder',
  ),
);

export const copyBuilder = async (buildDirectory: string) => {
  await fs.mkdir(buildDirectory, { recursive: true });
  await fs.cp(BUILDER_FILE_PATH, buildDirectory, { recursive: true });
};
