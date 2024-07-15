import { join } from 'path';
import { tmpdir } from 'os';
import { promises as fs } from 'fs';
import { fork } from 'child_process';

import { v4 } from 'uuid';

import { CodeEngineDriver } from 'src/engine/core-modules/code-engine/drivers/interfaces/code-engine-driver.interface';
import { FileFolder } from 'src/engine/core-modules/file/interfaces/file-folder.interface';

import { FileStorageService } from 'src/engine/integrations/file-storage/file-storage.service';
import { FileUploadService } from 'src/engine/core-modules/file/file-upload/services/file-upload.service';
import { readFileContent } from 'src/engine/integrations/file-storage/utils/read-file-content';
import { FunctionMetadataEntity } from 'src/engine/metadata-modules/function-metadata/function-metadata.entity';
import { compileTypescript } from 'src/engine/core-modules/code-engine/utils/compile-typescript';
import { SOURCE_FILE_NAME } from 'src/engine/core-modules/code-engine/drivers/constants/source-file-name';
import { BUILD_FILE_NAME } from 'src/engine/core-modules/code-engine/drivers/constants/build-file-name';

export interface LocalDriverOptions {
  fileStorageService: FileStorageService;
  fileUploadService: FileUploadService;
}

export class LocalDriver implements CodeEngineDriver {
  private readonly fileStorageService: FileStorageService;
  private readonly fileUploadService: FileUploadService;

  constructor(options: LocalDriverOptions) {
    this.fileUploadService = options.fileUploadService;
    this.fileStorageService = options.fileStorageService;
  }

  private _getFolderPath(functionMetadata: FunctionMetadataEntity) {
    return join(
      FileFolder.Function,
      functionMetadata.workspaceId,
      functionMetadata.id,
    );
  }

  async build(functionMetadata: FunctionMetadataEntity) {
    const folderPath = this._getFolderPath(functionMetadata);
    const fileStream = await this.fileStorageService.read({
      folderPath,
      filename: SOURCE_FILE_NAME,
    });
    const typescriptCode = await readFileContent(fileStream);
    const javascriptCode = compileTypescript(typescriptCode);

    await this.fileUploadService.uploadFile({
      file: javascriptCode,
      filename: BUILD_FILE_NAME,
      mimeType: undefined,
      fileFolder: folderPath,
      forceName: true,
    });
  }

  async execute(
    functionMetadata: FunctionMetadataEntity,
    payload: object | undefined = undefined,
  ): Promise<object> {
    const fileStream = await this.fileStorageService.read({
      folderPath: this._getFolderPath(functionMetadata),
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
