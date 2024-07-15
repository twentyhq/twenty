import { join } from 'path';

import { FileUpload } from 'graphql-upload';

import { FileFolder } from 'src/engine/core-modules/file/interfaces/file-folder.interface';

import { FileUploadService } from 'src/engine/core-modules/file/file-upload/services/file-upload.service';
import { readFileContent } from 'src/engine/integrations/file-storage/utils/read-file-content';
import { compileTypescript } from 'src/engine/integrations/custom-code-engine/utils/compile-typescript';

export class CommonDriver {
  private readonly fileUploadService: FileUploadService;

  constructor(fileUploadService) {
    this.fileUploadService = fileUploadService;
  }

  async generateAndSaveExecutableFiles(
    name: string,
    workspaceId: string,
    { createReadStream, mimetype }: FileUpload,
  ) {
    const typescriptCode = await readFileContent(createReadStream());
    const javascriptCode = compileTypescript(typescriptCode);
    const fileFolder = join(FileFolder.Function, workspaceId);

    const { path: sourceCodePath } = await this.fileUploadService.uploadFile({
      file: typescriptCode,
      filename: `${name}.ts`,
      mimeType: mimetype,
      fileFolder,
    });

    const { path: buildSourcePath } = await this.fileUploadService.uploadFile({
      file: javascriptCode,
      filename: `${name}.js`,
      mimeType: mimetype,
      fileFolder,
    });

    return {
      sourceCodePath,
      buildSourcePath,
      javascriptCode,
    };
  }
}
