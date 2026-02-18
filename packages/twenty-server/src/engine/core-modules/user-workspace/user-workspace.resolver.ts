import { UseGuards } from '@nestjs/common';
import { Args, Mutation } from '@nestjs/graphql';

import GraphQLUpload from 'graphql-upload/GraphQLUpload.mjs';
import { FileFolder } from 'twenty-shared/types';

import type { FileUpload } from 'graphql-upload/processRequest.mjs';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { SignedFileDTO } from 'src/engine/core-modules/file/file-upload/dtos/signed-file.dto';
import { FileUploadService } from 'src/engine/core-modules/file/file-upload/services/file-upload.service';
import { UploadProfilePicturePermissionGuard } from 'src/engine/core-modules/user-workspace/guards/upload-profile-picture-permission.guard';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { streamToBuffer } from 'src/utils/stream-to-buffer';

@MetadataResolver()
export class UserWorkspaceResolver {
  constructor(private readonly fileUploadService: FileUploadService) {}

  @Mutation(() => SignedFileDTO)
  @UseGuards(WorkspaceAuthGuard, UploadProfilePicturePermissionGuard)
  async uploadWorkspaceMemberProfilePictureLegacy(
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @Args({ name: 'file', type: () => GraphQLUpload })
    { createReadStream, filename, mimetype }: FileUpload,
  ): Promise<SignedFileDTO> {
    const stream = createReadStream();
    const buffer = await streamToBuffer(stream);
    const fileFolder = FileFolder.ProfilePicture;

    const { files } = await this.fileUploadService.uploadImage({
      file: buffer,
      filename,
      mimeType: mimetype,
      fileFolder,
      workspaceId,
    });

    if (!files.length) {
      throw new Error('Failed to upload profile picture');
    }

    return files[0];
  }
}
