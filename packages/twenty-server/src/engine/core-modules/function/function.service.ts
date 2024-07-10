import { Injectable } from '@nestjs/common';

import ts from 'typescript';
import { FileUpload } from 'graphql-upload';

import { FileFolder } from 'src/engine/core-modules/file/interfaces/file-folder.interface';

import { User } from 'src/engine/core-modules/user/user.entity';
import { FileUploadService } from 'src/engine/core-modules/file/file-upload/services/file-upload.service';

@Injectable()
export class FunctionService {
  constructor(private readonly fileUploadService: FileUploadService) {}

  async upsertFunction(
    workspaceId: string,
    user: User,
    { createReadStream, filename, mimetype }: FileUpload,
    name: string,
  ) {
    const fileContent = await this.readStreamToBuffer(createReadStream());

    const typescriptCode = fileContent.toString('utf8');
    const javascriptCode = this.compileTypeScript(typescriptCode);

    const { path: sourcePath } = await this.fileUploadService.uploadFile({
      file: typescriptCode,
      filename,
      mimeType: mimetype,
      fileFolder: FileFolder.Function,
    });

    const { path: compiledPath } = await this.fileUploadService.uploadFile({
      file: javascriptCode,
      filename: '.js',
      mimeType: mimetype,
      fileFolder: FileFolder.Function,
    });

    console.log(sourcePath);
    console.log(compiledPath);

    return sourcePath;
  }

  private async readStreamToBuffer(
    stream: NodeJS.ReadableStream,
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];

      stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
      stream.on('end', () => resolve(Buffer.concat(chunks)));
      stream.on('error', (err) => reject(err));
    });
  }

  private compileTypeScript(tsCode: string): string {
    const result = ts.transpileModule(tsCode, {
      compilerOptions: { module: ts.ModuleKind.CommonJS },
    });

    return result.outputText;
  }
}
