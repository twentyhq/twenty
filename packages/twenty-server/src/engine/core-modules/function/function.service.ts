import { Injectable } from '@nestjs/common';

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
import { CodeExecutorService } from 'src/engine/code-executor/code-executor.service';
import { FileStorageService } from 'src/engine/integrations/file-storage/file-storage.service';

@Injectable()
export class FunctionService {
  constructor(
    private readonly codeExecutorService: CodeExecutorService,
    private readonly fileUploadService: FileUploadService,
    private readonly fileStorageService: FileStorageService,
    private readonly userService: UserService,
    @InjectWorkspaceRepository(FunctionWorkspaceEntity)
    private readonly functionRepository: WorkspaceRepository<FunctionWorkspaceEntity>,
  ) {}

  async executeFunction(user: User, name: string) {
    const workspaceMember = await this.userService.loadWorkspaceMember(user);

    const functionToExecute = await this.functionRepository.findOneOrFail({
      where: {
        name,
        authorId: workspaceMember?.id,
      },
    });

    return this.codeExecutorService.execute(functionToExecute);
  }

  async upsertFunction(
    user: User,
    { createReadStream, filename, mimetype }: FileUpload,
    name: string,
  ) {
    const typescriptCode =
      await this.fileStorageService.readContent(createReadStream());

    const javascriptCode =
      this.codeExecutorService.compileTypeScript(typescriptCode);

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
}
