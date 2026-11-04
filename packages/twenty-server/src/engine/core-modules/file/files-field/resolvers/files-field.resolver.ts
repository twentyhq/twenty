import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Mutation } from '@nestjs/graphql';

import bytes from 'bytes';
import GraphQLUpload from 'graphql-upload/GraphQLUpload.mjs';
import { PermissionFlagType } from 'twenty-shared/constants';

import type { FileUpload } from 'graphql-upload/processRequest.mjs';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { settings } from 'src/engine/constants/settings';
import { FileWithSignedUrlDTO } from 'src/engine/core-modules/file/dtos/file-with-sign-url.dto';
import { FilesFieldService } from 'src/engine/core-modules/file/files-field/services/files-field.service';
import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { streamToBuffer } from 'src/utils/stream-to-buffer';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { UsageLimitGraphqlApiExceptionFilter } from 'src/engine/core-modules/usage-limit/filters/usage-limit-graphql-api-exception.filter';
import { AccessPolicyGuard } from 'src/engine/guards/access-policy.guard';

@UseGuards(
  AccessPolicyGuard({
    authPrincipals: {
      userSession: {
        standard: true,
        impersonated: true,
        playground: true,
        workspaceAgnostic: false,
      },
      apiKey: true,
      oauthClient: true,
      application: true,
    },
    requiredPermissionFlags: [PermissionFlagType.UPLOAD_FILE],
  }),
)
@UsePipes(ResolverValidationPipe)
@UseFilters(
  UsageLimitGraphqlApiExceptionFilter,
  PreventNestToAutoLogGraphqlErrorsFilter,
  AuthGraphqlApiExceptionFilter,
)
@MetadataResolver()
export class FilesFieldResolver {
  constructor(private readonly filesFieldService: FilesFieldService) {}

  @Mutation(() => FileWithSignedUrlDTO, {
    deprecationReason:
      'Use createFileUpload with the FilesField folder and the fieldMetadataUniversalIdentifier, then completeFileUpload, which send the file straight to file storage.',
  })
  async uploadFilesFieldFileByUniversalIdentifier(
    @AuthWorkspace()
    { id: workspaceId }: WorkspaceEntity,
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
      bytes(settings.storage.maxMultipartFileSize) ?? undefined,
    );

    return await this.filesFieldService.uploadFile({
      file: buffer,
      filename,
      workspaceId,
      fieldMetadataUniversalIdentifier,
    });
  }
}
