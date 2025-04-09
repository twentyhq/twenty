import { promises as fs } from 'fs';

import { getExecutorFilePath } from 'src/engine/core-modules/serverless/drivers/utils/get-executor-file-path';

export const copyExecutor = async (buildDirectory: string) => {
  await fs.mkdir(buildDirectory, {
    recursive: true,
  });
  await fs.cp(getExecutorFilePath(), buildDirectory, {
    recursive: true,
  });
};
