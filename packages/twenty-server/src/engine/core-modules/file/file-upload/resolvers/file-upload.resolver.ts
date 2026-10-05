import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Mutation } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';
import { FileFolder } from 'twenty-shared/types';
import { assertIsDefinedOrThrow } from 'twenty-shared/utils';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { ApplicationExceptionFilter } from 'src/engine/core-modules/application/application-exception-filter';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { resolveTargetApplicationOrThrow } from 'src/engine/core-modules/application/utils/resolve-target-application-or-throw.util';
import { FileWithSignedUrlDTO } from 'src/engine/core-modules/file/dtos/file-with-sign-url.dto';
import { FileUploadTargetDTO } from 'src/engine/core-modules/file/file-upload/dtos/file-upload-target.dto';
import { FileUploadGraphqlApiExceptionFilter } from 'src/engine/core-modules/file/file-upload/filters/file-upload-graphql-api-exception.filter';
import { CreateFileUploadPermissionGuard } from 'src/engine/core-modules/file/file-upload/guards/create-file-upload-permission.guard';
import { FileUploadService } from 'src/engine/core-modules/file/file-upload/services/file-upload.service';
import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthApplication } from 'src/engine/decorators/auth/auth-application.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { AuthPrincipalGuard } from 'src/engine/guards/auth-principal.guard';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { UsageLimitGraphqlApiExceptionFilter } from 'src/engine/core-modules/usage-limit/filters/usage-limit-graphql-api-exception.filter';

@UseGuards(
  AuthPrincipalGuard({
    userSession: {
      standard: true,
      impersonated: true,
      playground: true,
      workspaceAgnostic: false,
    },
    apiKey: true,
    oauthClient: true,
    application: true,
  }),
)
@UsePipes(ResolverValidationPipe)
@UseFilters(
  UsageLimitGraphqlApiExceptionFilter,
  FileUploadGraphqlApiExceptionFilter,
  ApplicationExceptionFilter,
  PreventNestToAutoLogGraphqlErrorsFilter,
  AuthGraphqlApiExceptionFilter,
)
@MetadataResolver()
export class FileUploadResolver {
  constructor(private readonly fileUploadService: FileUploadService) {}

  @Mutation(() => FileUploadTargetDTO)
  @UseGuards(CreateFileUploadPermissionGuard)
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
    // Owner of the variable an ApplicationVariable file is uploaded for.
    // Inferred from the token for an application caller; required for a session.
    @Args({ name: 'applicationId', type: () => UUIDScalarType, nullable: true })
    applicationId?: string,
    @AuthApplication({ allowUndefined: true })
    callingApplication?: FlatApplication,
  ): Promise<FileUploadTargetDTO> {
    return await this.fileUploadService.createFileUpload({
      workspaceId,
      filename,
      size,
      fileFolder,
      fieldMetadataId,
      fieldMetadataUniversalIdentifier,
      applicationId:
        fileFolder === FileFolder.ApplicationVariable
          ? this.resolveApplicationVariableApplicationId({
              callingApplication,
              applicationId,
            })
          : undefined,
    });
  }

  private resolveApplicationVariableApplicationId({
    callingApplication,
    applicationId,
  }: {
    callingApplication?: FlatApplication;
    applicationId?: string;
  }): string {
    const { targetApplicationId } = resolveTargetApplicationOrThrow({
      callingApplication,
      applicationId,
    });

    // Without a universal identifier the lookup always carries an id
    assertIsDefinedOrThrow(targetApplicationId);

    return targetApplicationId;
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
