import { join } from 'path';
import * as fs from 'fs/promises';

import { v4 } from 'uuid';

import { SERVERLESS_TMPDIR_FOLDER } from 'src/engine/core-modules/serverless/drivers/constants/serverless-tmpdir-folder';

export const NODE_LAYER_SUBFOLDER = 'nodejs';

const TEMPORARY_LAMBDA_FOLDER = 'lambda-build';
const LAMBDA_ZIP_FILE_NAME = 'lambda.zip';

export class LambdaBuildDirectoryManager {
  private temporaryDir = join(
    SERVERLESS_TMPDIR_FOLDER,
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
