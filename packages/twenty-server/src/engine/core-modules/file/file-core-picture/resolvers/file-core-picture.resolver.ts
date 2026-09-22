import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Mutation } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { FileWithSignedUrlDTO } from 'src/engine/core-modules/file/dtos/file-with-sign-url.dto';
import { FileCorePictureService } from 'src/engine/core-modules/file/file-core-picture/services/file-core-picture.service';
import { FileUploadTargetDTO } from 'src/engine/core-modules/file/file-upload/dtos/file-upload-target.dto';
import { FileUploadGraphqlApiExceptionFilter } from 'src/engine/core-modules/file/file-upload/filters/file-upload-graphql-api-exception.filter';
import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { UsageLimitGraphqlApiExceptionFilter } from 'src/engine/core-modules/usage-limit/filters/usage-limit-graphql-api-exception.filter';
import { UploadProfilePicturePermissionGuard } from 'src/engine/core-modules/user-workspace/guards/upload-profile-picture-permission.guard';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { PermissionsGraphqlApiExceptionFilter } from 'src/engine/metadata-modules/permissions/utils/permissions-graphql-api-exception.filter';

@UseGuards(WorkspaceAuthGuard)
@UsePipes(ResolverValidationPipe)
@UseFilters(
  UsageLimitGraphqlApiExceptionFilter,
  PermissionsGraphqlApiExceptionFilter,
  FileUploadGraphqlApiExceptionFilter,
  PreventNestToAutoLogGraphqlErrorsFilter,
  AuthGraphqlApiExceptionFilter,
)
@MetadataResolver()
export class FileCorePictureResolver {
  constructor(
    private readonly fileCorePictureService: FileCorePictureService,
  ) {}

  @Mutation(() => FileUploadTargetDTO)
  @UseGuards(
    WorkspaceAuthGuard,
    SettingsPermissionGuard(PermissionFlagType.WORKSPACE),
  )
  async createWorkspaceLogoUpload(
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @Args({ name: 'filename', type: () => String })
    filename: string,
    @Args({ name: 'size', type: () => Number })
    size: number,
  ): Promise<FileUploadTargetDTO> {
    return this.fileCorePictureService.createWorkspaceLogoUpload({
      workspaceId,
      filename,
      size,
    });
  }

  @Mutation(() => FileWithSignedUrlDTO)
  @UseGuards(
    WorkspaceAuthGuard,
    SettingsPermissionGuard(PermissionFlagType.WORKSPACE),
  )
  async completeWorkspaceLogoUpload(
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @Args({ name: 'fileId', type: () => String })
    fileId: string,
  ): Promise<FileWithSignedUrlDTO> {
    return this.fileCorePictureService.completeWorkspaceLogoUpload({
      workspaceId,
      fileId,
    });
  }

  @Mutation(() => FileUploadTargetDTO)
  @UseGuards(WorkspaceAuthGuard, UploadProfilePicturePermissionGuard)
  async createWorkspaceMemberProfilePictureUpload(
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @Args({ name: 'filename', type: () => String })
    filename: string,
    @Args({ name: 'size', type: () => Number })
    size: number,
  ): Promise<FileUploadTargetDTO> {
    return this.fileCorePictureService.createWorkspaceMemberProfilePictureUpload(
      {
        workspaceId,
        filename,
        size,
      },
    );
  }

  @Mutation(() => FileWithSignedUrlDTO)
  @UseGuards(WorkspaceAuthGuard, UploadProfilePicturePermissionGuard)
  async completeWorkspaceMemberProfilePictureUpload(
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @Args({ name: 'fileId', type: () => String })
    fileId: string,
  ): Promise<FileWithSignedUrlDTO> {
    return this.fileCorePictureService.completeWorkspaceMemberProfilePictureUpload(
      {
        workspaceId,
        fileId,
      },
    );
  }
}
