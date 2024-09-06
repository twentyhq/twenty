import { join } from 'path';
import * as fs from 'fs/promises';

import { v4 } from 'uuid';

import { SERVERLESS_TMPDIR_FOLDER } from 'src/engine/integrations/serverless/drivers/constants/serverless-tmpdir-folder';

export const NODE_LAYER_SUBFOLDER = 'nodejs';

const TEMPORARY_LAMBDA_FOLDER = 'lambda-build';
const TEMPORARY_LAMBDA_SOURCE_FOLDER = 'src';
const LAMBDA_ZIP_FILE_NAME = 'lambda.zip';
const LAMBDA_ENTRY_FILE_NAME = 'index.js';

export class LambdaBuildDirectoryManager {
  private temporaryDir = join(
    SERVERLESS_TMPDIR_FOLDER,
    `${TEMPORARY_LAMBDA_FOLDER}-${v4()}`,
  );
  private lambdaHandler = `${LAMBDA_ENTRY_FILE_NAME.split('.')[0]}.handler`;

  async init() {
    const sourceTemporaryDir = join(
      this.temporaryDir,
      TEMPORARY_LAMBDA_SOURCE_FOLDER,
    );
    const lambdaZipPath = join(this.temporaryDir, LAMBDA_ZIP_FILE_NAME);
    const javascriptFilePath = join(sourceTemporaryDir, LAMBDA_ENTRY_FILE_NAME);

    await fs.mkdir(sourceTemporaryDir, { recursive: true });

    return {
      sourceTemporaryDir,
      lambdaZipPath,
      javascriptFilePath,
      lambdaHandler: this.lambdaHandler,
    };
  }

  async clean() {
    await fs.rm(this.temporaryDir, { recursive: true, force: true });
  }
}
