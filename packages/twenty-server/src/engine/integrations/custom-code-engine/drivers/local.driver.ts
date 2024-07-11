import { join } from 'path';
import { tmpdir } from 'os';
import { promises as fs } from 'fs';
import { fork } from 'child_process';

import { v4 } from 'uuid';
import { FileUpload } from 'graphql-upload';

import { CustomCodeEngineDriver } from 'src/engine/integrations/custom-code-engine/drivers/interfaces/custom-code-engine-driver.interface';
import { FileFolder } from 'src/engine/core-modules/file/interfaces/file-folder.interface';

import { FunctionWorkspaceEntity } from 'src/modules/function/stadard-objects/function.workspace-entity';
import { FileStorageService } from 'src/engine/integrations/file-storage/file-storage.service';
import { FileUploadService } from 'src/engine/core-modules/file/file-upload/services/file-upload.service';
import { readFileContent } from 'src/engine/integrations/file-storage/utils/read-file-content';
import { compileTypescript } from 'src/engine/integrations/custom-code-engine/utils/compile-typescript';

export class LocalDriver implements CustomCodeEngineDriver {
  constructor(
    private readonly fileStorageService: FileStorageService,
    private readonly fileUploadService: FileUploadService,
  ) {}

  async upsert({ createReadStream, filename, mimetype }: FileUpload) {
    const typescriptCode = await readFileContent(createReadStream());
    const javascriptCode = compileTypescript(typescriptCode);

    const { path: sourceCodePath } = await this.fileUploadService.uploadFile({
      file: typescriptCode,
      filename,
      mimeType: mimetype,
      fileFolder: FileFolder.Function,
    });

    const { path: builtSourcePath } = await this.fileUploadService.uploadFile({
      file: javascriptCode,
      filename: '.js',
      mimeType: mimetype,
      fileFolder: FileFolder.Function,
    });

    return {
      sourceCodePath,
      builtSourcePath,
      lambdaName: undefined,
    };
  }

  async execute(
    functionToExecute: FunctionWorkspaceEntity,
    event: object | undefined = undefined,
    context: object | undefined = undefined,
  ): Promise<object> {
    const fileStream = await this.fileStorageService.read({
      folderPath: '',
      filename: functionToExecute.builtSourcePath,
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

      child.send({ event, context });
    });
  }
}
