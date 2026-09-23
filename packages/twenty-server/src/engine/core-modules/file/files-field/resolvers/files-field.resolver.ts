import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Mutation } from '@nestjs/graphql';

import bytes from 'bytes';
import GraphQLUpload from 'graphql-upload/GraphQLUpload.mjs';
import { PermissionFlagType } from 'twenty-shared/constants';

import type { FileUpload } from 'graphql-upload/processRequest.mjs';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { ApiKeyEntity } from 'src/engine/core-modules/api-key/api-key.entity';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { settings } from 'src/engine/constants/settings';
import { FileWithSignedUrlDTO } from 'src/engine/core-modules/file/dtos/file-with-sign-url.dto';
import { buildFileUploadPrincipal } from 'src/engine/core-modules/file/file-upload/utils/build-file-upload-principal.util';
import { FilesFieldService } from 'src/engine/core-modules/file/files-field/services/files-field.service';
import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthApiKey } from 'src/engine/decorators/auth/auth-api-key.decorator';
import { AuthApplication } from 'src/engine/decorators/auth/auth-application.decorator';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { streamToBuffer } from 'src/utils/stream-to-buffer';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { UsageLimitGraphqlApiExceptionFilter } from 'src/engine/core-modules/usage-limit/filters/usage-limit-graphql-api-exception.filter';

@UseGuards(WorkspaceAuthGuard)
@UsePipes(ResolverValidationPipe)
@UseFilters(
  UsageLimitGraphqlApiExceptionFilter,
  PreventNestToAutoLogGraphqlErrorsFilter,
  AuthGraphqlApiExceptionFilter,
)
@MetadataResolver()
export class FilesFieldResolver {
  constructor(private readonly filesFieldService: FilesFieldService) {}

  @Mutation(() => FileWithSignedUrlDTO)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.UPLOAD_FILE))
  async uploadFilesFieldFileByUniversalIdentifier(
    @AuthWorkspace()
    { id: workspaceId }: WorkspaceEntity,
    @AuthApplication({ allowUndefined: true })
    application: FlatApplication | undefined,
    @AuthUserWorkspaceId({ allowUndefined: true })
    userWorkspaceId: string | undefined,
    @AuthApiKey()
    apiKey: ApiKeyEntity | undefined,
    @Args({ name: 'file', type: () => GraphQLUpload })
    { createReadStream, filename }: FileUpload,
    @Args({
      name: 'fieldMetadataUniversalIdentifier',
      type: () => String,
      nullable: false,
    })
    fieldMetadataUniversalIdentifier: string,
  ): Promise<FileWithSignedUrlDTO> {
    const stream = createReadStream();
    const buffer = await streamToBuffer(
      stream,
      bytes(settings.storage.maxFileSize) ?? undefined,
    );

    return await this.filesFieldService.uploadFile({
      file: buffer,
      filename,
      workspaceId,
      fieldMetadataUniversalIdentifier,
      principal: buildFileUploadPrincipal({
        application,
        userWorkspaceId,
        apiKey,
      }),
    });
  }
}
