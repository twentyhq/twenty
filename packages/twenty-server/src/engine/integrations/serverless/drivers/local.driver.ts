import { join } from 'path';
import { tmpdir } from 'os';
import { promises as fs } from 'fs';
import { fork } from 'child_process';

import { v4 } from 'uuid';

import { ServerlessDriver } from 'src/engine/integrations/serverless/drivers/interfaces/serverless-driver.interface';

import { FileStorageService } from 'src/engine/integrations/file-storage/file-storage.service';
import { readFileContent } from 'src/engine/integrations/file-storage/utils/read-file-content';
import { ServerlessFunctionEntity } from 'src/engine/metadata-modules/serverless-function/serverless-function.entity';
import { BUILD_FILE_NAME } from 'src/engine/integrations/serverless/drivers/constants/build-file-name';
import { BaseServerlessDriver } from 'src/engine/integrations/serverless/drivers/base-serverless.driver';

export interface LocalDriverOptions {
  fileStorageService: FileStorageService;
}

export class LocalDriver
  extends BaseServerlessDriver
  implements ServerlessDriver
{
  private readonly fileStorageService: FileStorageService;

  constructor(options: LocalDriverOptions) {
    super();
    this.fileStorageService = options.fileStorageService;
  }

  async build(serverlessFunction: ServerlessFunctionEntity) {
    const javascriptCode = await this.getCompiledCode(
      serverlessFunction,
      this.fileStorageService,
    );

    await this.fileStorageService.write({
      file: javascriptCode,
      name: BUILD_FILE_NAME,
      mimeType: undefined,
      folder: this.getFolderPath(serverlessFunction),
    });
  }

  async execute(
    serverlessFunction: ServerlessFunctionEntity,
    payload: object | undefined = undefined,
  ): Promise<object> {
    const fileStream = await this.fileStorageService.read({
      folderPath: this.getFolderPath(serverlessFunction),
      filename: BUILD_FILE_NAME,
    });
    const fileContent = await readFileContent(fileStream);

    const tmpFilePath = join(tmpdir(), `${v4()}.js`);

    const modifiedContent = `
    process.on('message', async (message) => {
      const { event, context } = message;
      const result = await handler(event, context);
      process.send(result);
    });

    ${fileContent}
    `;

    await fs.writeFile(tmpFilePath, modifiedContent);

    return await new Promise((resolve, reject) => {
      const child = fork(tmpFilePath);

      child.on('message', (message: object) => {
        resolve(message);
        child.kill();
        fs.unlink(tmpFilePath);
      });

      child.on('error', (error) => {
        reject(error);
        child.kill();
        fs.unlink(tmpFilePath);
      });

      child.on('exit', (code) => {
        if (code && code !== 0) {
          reject(new Error(`Child process exited with code ${code}`));
          fs.unlink(tmpFilePath);
        }
      });

      child.send({ event: payload });
    });
  }
}
