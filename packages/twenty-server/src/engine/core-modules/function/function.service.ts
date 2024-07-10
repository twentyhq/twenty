import { Injectable } from '@nestjs/common';

import ts from 'typescript';
import { FileUpload } from 'graphql-upload';

import { FileFolder } from 'src/engine/core-modules/file/interfaces/file-folder.interface';

import { User } from 'src/engine/core-modules/user/user.entity';
import { FileUploadService } from 'src/engine/core-modules/file/file-upload/services/file-upload.service';
import { UserService } from 'src/engine/core-modules/user/services/user.service';
import { InjectWorkspaceRepository } from 'src/engine/twenty-orm/decorators/inject-workspace-repository.decorator';
import { WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';
import {
  FunctionSyncStatus,
  FunctionWorkspaceEntity,
} from 'src/modules/function/stadard-objects/function.workspace-entity';

@Injectable()
export class FunctionService {
  constructor(
    private readonly fileUploadService: FileUploadService,
    private readonly userService: UserService,
    @InjectWorkspaceRepository(FunctionWorkspaceEntity)
    private readonly functionRepository: WorkspaceRepository<FunctionWorkspaceEntity>,
  ) {}

  async upsertFunction(
    user: User,
    { createReadStream, filename, mimetype }: FileUpload,
    name: string,
  ) {
    const fileContent = await this.readStreamToBuffer(createReadStream());

    const typescriptCode = fileContent.toString('utf8');
    const javascriptCode = this.compileTypeScript(typescriptCode);

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

    const workspaceMember = await this.userService.loadWorkspaceMember(user);
    const createdFunction = await this.functionRepository.save({
      name,
      author: workspaceMember,
      sourceCodePath,
      builtSourcePath,
      syncStatus: FunctionSyncStatus.READY,
    });

    return createdFunction.sourceCodePath;
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
