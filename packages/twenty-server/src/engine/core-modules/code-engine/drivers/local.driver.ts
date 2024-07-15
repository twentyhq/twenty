import { join } from 'path';
import { tmpdir } from 'os';
import { promises as fs } from 'fs';
import { fork } from 'child_process';

import { v4 } from 'uuid';
import { FileUpload } from 'graphql-upload';

import { CodeEngineDriver } from 'src/engine/core-modules/code-engine/drivers/interfaces/code-engine-driver.interface';

import { FileStorageService } from 'src/engine/integrations/file-storage/file-storage.service';
import { FileUploadService } from 'src/engine/core-modules/file/file-upload/services/file-upload.service';
import { readFileContent } from 'src/engine/integrations/file-storage/utils/read-file-content';
import { FunctionMetadataEntity } from 'src/engine/metadata-modules/function-metadata/function-metadata.entity';
import { CommonDriver } from 'src/engine/core-modules/code-engine/drivers/common.driver';

export interface LocalDriverOptions {
  fileStorageService: FileStorageService;
  fileUploadService: FileUploadService;
}

export class LocalDriver extends CommonDriver implements CodeEngineDriver {
  private readonly fileStorageService: FileStorageService;

  constructor(options: LocalDriverOptions) {
    super(options.fileUploadService);
    this.fileStorageService = options.fileStorageService;
  }

  async generateExecutable(
    name: string,
    workspaceId: string,
    file: FileUpload,
  ) {
    return await this.generateAndSaveExecutableFiles(name, workspaceId, file);
  }

  async execute(
    functionToExecute: FunctionMetadataEntity,
    payload: object | undefined = undefined,
  ): Promise<object> {
    const fileStream = await this.fileStorageService.read({
      folderPath: '',
      filename: functionToExecute.buildSourcePath,
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
