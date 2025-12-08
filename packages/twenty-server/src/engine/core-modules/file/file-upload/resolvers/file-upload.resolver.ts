import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';

import GraphQLUpload from 'graphql-upload/GraphQLUpload.mjs';
import { PermissionFlagType } from 'twenty-shared/constants';

import { FileFolder } from 'src/engine/core-modules/file/interfaces/file-folder.interface';

import type { FileUpload } from 'graphql-upload/processRequest.mjs';

import { SignedFileDTO } from 'src/engine/core-modules/file/file-upload/dtos/signed-file.dto';
import { FileUploadService } from 'src/engine/core-modules/file/file-upload/services/file-upload.service';
import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { streamToBuffer } from 'src/utils/stream-to-buffer';

@UseGuards(WorkspaceAuthGuard)
@UsePipes(ResolverValidationPipe)
@UseFilters(PreventNestToAutoLogGraphqlErrorsFilter)
@Resolver()
export class FileUploadResolver {
  constructor(private readonly fileUploadService: FileUploadService) {}

  @Mutation(() => SignedFileDTO)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.UPLOAD_FILE))
  async uploadFile(
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
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

    if (!files.length) {
      throw new Error('Failed to upload file');
    }

    return files[0];
  }

  @Mutation(() => SignedFileDTO)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.UPLOAD_FILE))
  async uploadImage(
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
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

    if (!files.length) {
      throw new Error('Failed to upload image');
    }

    return files[0];
  }
}
