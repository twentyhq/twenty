import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Mutation } from '@nestjs/graphql';

import bytes from 'bytes';
import GraphQLUpload from 'graphql-upload/GraphQLUpload.mjs';
import { PermissionFlagType } from 'twenty-shared/constants';

import type { FileUpload } from 'graphql-upload/processRequest.mjs';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { settings } from 'src/engine/constants/settings';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { FileWithSignedUrlDTO } from 'src/engine/core-modules/file/dtos/file-with-sign-url.dto';
import { FileCorePictureService } from 'src/engine/core-modules/file/file-core-picture/services/file-core-picture.service';
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
import { streamToBuffer } from 'src/utils/stream-to-buffer';

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

  @Mutation(() => FileWithSignedUrlDTO, {
    deprecationReason:
      'Use createFileUpload with the CorePicture folder and completeWorkspaceLogoUpload, which send the logo straight to file storage.',
  })
  @UseGuards(
    WorkspaceAuthGuard,
    SettingsPermissionGuard(PermissionFlagType.WORKSPACE),
  )
  async uploadWorkspaceLogo(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args({ name: 'file', type: () => GraphQLUpload })
    { createReadStream, filename }: FileUpload,
  ): Promise<FileWithSignedUrlDTO> {
    const buffer = await streamToBuffer(
      createReadStream(),
      bytes(settings.storage.maxFileSize) ?? undefined,
    );

    return await this.fileCorePictureService.uploadWorkspacePicture({
      file: buffer,
      filename,
      workspace,
    });
  }

  @Mutation(() => FileWithSignedUrlDTO, {
    deprecationReason:
      'Use createFileUpload with the CorePicture folder and completeWorkspaceMemberProfilePictureUpload, which send the picture straight to file storage.',
  })
  @UseGuards(WorkspaceAuthGuard, UploadProfilePicturePermissionGuard)
  async uploadWorkspaceMemberProfilePicture(
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @Args({ name: 'file', type: () => GraphQLUpload })
    { createReadStream, filename }: FileUpload,
  ): Promise<FileWithSignedUrlDTO> {
    const buffer = await streamToBuffer(
      createReadStream(),
      bytes(settings.storage.maxFileSize) ?? undefined,
    );

    return await this.fileCorePictureService.uploadWorkspaceMemberProfilePicture(
      {
        file: buffer,
        filename,
        workspaceId,
      },
    );
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
