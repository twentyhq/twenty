import { Injectable } from '@nestjs/common';

import { join } from 'path';
import { tmpdir } from 'os';
import fs from 'fs';

import fsExtra from 'fs-extra';
import { v4 } from 'uuid';

const TEMPORARY_LAMBDA_FOLDER = 'twenty-build-lambda-temp-folder';
const TEMPORARY_LAMBDA_SOURCE_FOLDER = 'src';
const LAMBDA_ZIP_FILE_NAME = 'lambda.zip';
const LAMBDA_ENTRY_FILE_NAME = 'index.js';

@Injectable()
export class BuildDirectoryManagerService {
  private temporaryDir = join(tmpdir(), `${TEMPORARY_LAMBDA_FOLDER}_${v4()}`);
  private lambdaHandler = `${LAMBDA_ENTRY_FILE_NAME.split('.')[0]}.handler`;

  async init() {
    const sourceTemporaryDir = join(
      this.temporaryDir,
      TEMPORARY_LAMBDA_SOURCE_FOLDER,
    );
    const lambdaZipPath = join(this.temporaryDir, LAMBDA_ZIP_FILE_NAME);
    const javascriptFilePath = join(sourceTemporaryDir, LAMBDA_ENTRY_FILE_NAME);

    if (!fs.existsSync(this.temporaryDir)) {
      await fs.promises.mkdir(this.temporaryDir);
      await fs.promises.mkdir(sourceTemporaryDir);
    } else {
      await fsExtra.emptyDir(this.temporaryDir);
      await fs.promises.mkdir(sourceTemporaryDir);
    }

    return {
      sourceTemporaryDir,
      lambdaZipPath,
      javascriptFilePath,
      lambdaHandler: this.lambdaHandler,
    };
  }

  async clean() {
    await fsExtra.emptyDir(this.temporaryDir);
    await fs.promises.rmdir(this.temporaryDir);
  }
}
