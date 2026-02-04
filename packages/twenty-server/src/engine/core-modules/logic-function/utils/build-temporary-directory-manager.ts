import * as fs from 'fs/promises';
import { join } from 'path';

import { v4 } from 'uuid';

import { LOGIC_FUNCTION_EXECUTOR_TMPDIR_FOLDER } from 'src/engine/core-modules/logic-function/logic-function-drivers/constants/logic-function-executor-tmpdir-folder';

const TEMPORARY_BUILD_FOLDER = 'source-build';
const ZIP_FILE_NAME = 'lambda.zip';

export class BuildTemporaryDirectoryManager {
  private temporaryDir = join(
    LOGIC_FUNCTION_EXECUTOR_TMPDIR_FOLDER,
    `${TEMPORARY_BUILD_FOLDER}-${v4()}`,
  );

  async init(): Promise<{
    sourceTemporaryDir: string;
    lambdaZipPath: string;
  }> {
    const sourceTemporaryDir = join(this.temporaryDir);
    const lambdaZipPath = join(this.temporaryDir, ZIP_FILE_NAME);

    await fs.mkdir(sourceTemporaryDir, { recursive: true });

    return {
      sourceTemporaryDir,
      lambdaZipPath,
    };
  }

  async clean(): Promise<void> {
    await fs.rm(this.temporaryDir, { recursive: true, force: true });
  }
}
