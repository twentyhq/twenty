import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Mutation } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';
import { FileFolder } from 'twenty-shared/types';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { FileWithSignedUrlDTO } from 'src/engine/core-modules/file/dtos/file-with-sign-url.dto';
import { FileUploadTargetDTO } from 'src/engine/core-modules/file/file-upload/dtos/file-upload-target.dto';
import { FileUploadService } from 'src/engine/core-modules/file/file-upload/services/file-upload.service';
import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

@UseGuards(WorkspaceAuthGuard)
@UsePipes(ResolverValidationPipe)
@UseFilters(PreventNestToAutoLogGraphqlErrorsFilter)
@MetadataResolver()
export class FileUploadResolver {
  constructor(private readonly fileUploadService: FileUploadService) {}

  @Mutation(() => FileUploadTargetDTO)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.UPLOAD_FILE))
  async createFileUpload(
    @AuthWorkspace()
    { id: workspaceId }: WorkspaceEntity,
    @Args({ name: 'filename', type: () => String })
    filename: string,
    @Args({ name: 'size', type: () => Number })
    size: number,
    @Args({ name: 'fileFolder', type: () => FileFolder })
    fileFolder: FileFolder,
    @Args({ name: 'fieldMetadataId', type: () => String, nullable: true })
    fieldMetadataId?: string,
    @Args({
      name: 'fieldMetadataUniversalIdentifier',
      type: () => String,
      nullable: true,
    })
    fieldMetadataUniversalIdentifier?: string,
  ): Promise<FileUploadTargetDTO> {
    return await this.fileUploadService.createFileUpload({
      workspaceId,
      filename,
      size,
      fileFolder,
      fieldMetadataId,
      fieldMetadataUniversalIdentifier,
    });
  }

  @Mutation(() => FileWithSignedUrlDTO)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.UPLOAD_FILE))
  async completeFileUpload(
    @AuthWorkspace()
    { id: workspaceId }: WorkspaceEntity,
    @Args({ name: 'fileId', type: () => String })
    fileId: string,
  ): Promise<FileWithSignedUrlDTO> {
    return await this.fileUploadService.completeFileUpload({
      workspaceId,
      fileId,
    });
  }
}
