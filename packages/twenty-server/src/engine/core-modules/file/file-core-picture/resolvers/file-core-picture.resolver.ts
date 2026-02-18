import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Mutation } from '@nestjs/graphql';

import GraphQLUpload from 'graphql-upload/GraphQLUpload.mjs';
import { PermissionFlagType } from 'twenty-shared/constants';

import type { FileUpload } from 'graphql-upload/processRequest.mjs';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { FileWithSignedUrlDto } from 'src/engine/core-modules/file/dtos/file-with-sign-url.dto';
import { FileCorePictureService } from 'src/engine/core-modules/file/file-core-picture/services/file-core-picture.service';
import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
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
  PermissionsGraphqlApiExceptionFilter,
  PreventNestToAutoLogGraphqlErrorsFilter,
)
@MetadataResolver()
export class FileCorePictureResolver {
  constructor(
    private readonly fileCorePictureService: FileCorePictureService,
  ) {}

  @Mutation(() => FileWithSignedUrlDto)
  @UseGuards(
    WorkspaceAuthGuard,
    SettingsPermissionGuard(PermissionFlagType.WORKSPACE),
  )
  async uploadWorkspaceLogo(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args({ name: 'file', type: () => GraphQLUpload })
    { createReadStream, filename }: FileUpload,
  ): Promise<FileWithSignedUrlDto> {
    const buffer = await streamToBuffer(createReadStream());

    return await this.fileCorePictureService.uploadWorkspacePicture({
      file: buffer,
      filename,
      workspace,
    });
  }

  @Mutation(() => FileWithSignedUrlDto)
  @UseGuards(WorkspaceAuthGuard, UploadProfilePicturePermissionGuard)
  async uploadWorkspaceMemberProfilePicture(
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @Args({ name: 'file', type: () => GraphQLUpload })
    { createReadStream, filename }: FileUpload,
  ): Promise<FileWithSignedUrlDto> {
    const buffer = await streamToBuffer(createReadStream());

    return await this.fileCorePictureService.uploadWorkspaceMemberProfilePicture(
      {
        file: buffer,
        filename,
        workspaceId,
      },
    );
  }
}
