import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';

import { FileUpload, GraphQLUpload } from 'graphql-upload';

import { FileFolder } from 'src/engine/core-modules/file/interfaces/file-folder.interface';

import { FileUploadService } from 'src/engine/core-modules/file/file-upload/services/file-upload.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { streamToBuffer } from 'src/utils/stream-to-buffer';
import { SignedFileDTO } from 'src/engine/core-modules/file/file-upload/dtos/signed-file.dto';

@UseGuards(WorkspaceAuthGuard)
@Resolver()
export class FileUploadResolver {
  constructor(private readonly fileUploadService: FileUploadService) {}

  @Mutation(() => SignedFileDTO)
  async uploadFile(
    @AuthWorkspace() { id: workspaceId }: Workspace,
    @Args({ name: 'file', type: () => GraphQLUpload })
    { createReadStream, filename, mimetype }: FileUpload,
    @Args('fileFolder', { type: () => FileFolder, nullable: true })
    fileFolder: FileFolder,
  ): Promise<SignedFileDTO> {
    const stream = createReadStream();
    const buffer = await streamToBuffer(stream);

    const { files } = await this.fileUploadService.uploadFile({
      file: buffer,
      filename,
      mimeType: mimetype,
      fileFolder,
      workspaceId,
    });

    return files[0];
  }

  @Mutation(() => SignedFileDTO)
  async uploadImage(
    @AuthWorkspace() { id: workspaceId }: Workspace,
    @Args({ name: 'file', type: () => GraphQLUpload })
    { createReadStream, filename, mimetype }: FileUpload,
    @Args('fileFolder', { type: () => FileFolder, nullable: true })
    fileFolder: FileFolder,
  ): Promise<SignedFileDTO> {
    const stream = createReadStream();
    const buffer = await streamToBuffer(stream);

    const { files } = await this.fileUploadService.uploadImage({
      file: buffer,
      filename,
      mimeType: mimetype,
      fileFolder,
      workspaceId,
    });

    return files[0];
  }
}
