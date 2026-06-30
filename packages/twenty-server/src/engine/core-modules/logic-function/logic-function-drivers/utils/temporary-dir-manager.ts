import { join } from 'path';
import * as fs from 'fs/promises';

import { v4 } from 'uuid';

import { LOGIC_FUNCTION_EXECUTOR_TMPDIR_FOLDER } from 'src/engine/core-modules/logic-function/logic-function-drivers/constants/logic-function-executor-tmpdir-folder';

const TEMPORARY_LAMBDA_FOLDER = 'lambda-build';
const LAMBDA_ZIP_FILE_NAME = 'lambda.zip';

export class TemporaryDirManager {
  private temporaryDir = join(
    LOGIC_FUNCTION_EXECUTOR_TMPDIR_FOLDER,
    `${TEMPORARY_LAMBDA_FOLDER}-${v4()}`,
  );

  async init() {
    const sourceTemporaryDir = join(this.temporaryDir);
    const lambdaZipPath = join(this.temporaryDir, LAMBDA_ZIP_FILE_NAME);

    await fs.mkdir(sourceTemporaryDir, { recursive: true });

    return {
      sourceTemporaryDir,
      lambdaZipPath,
    };
  }

  async clean() {
    await fs.rm(this.temporaryDir, { recursive: true, force: true });
  }
}
