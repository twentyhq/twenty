import {
  UseFilters,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { Args, Mutation } from '@nestjs/graphql';

import GraphQLUpload from 'graphql-upload/GraphQLUpload.mjs';
import { PermissionFlagType } from 'twenty-shared/constants';
import { FileFolder } from 'twenty-shared/types';

import type { FileUpload } from 'graphql-upload/processRequest.mjs';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { ApplicationExceptionFilter } from 'src/engine/core-modules/application/application-exception-filter';
import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import { ApplicationDTO } from 'src/engine/core-modules/application/dtos/application.dto';
import { ApplicationInput } from 'src/engine/core-modules/application/dtos/application.input';
import { CreateApplicationInput } from 'src/engine/core-modules/application/dtos/create-application.input';
import { GenerateApplicationTokenInput } from 'src/engine/core-modules/application/dtos/generate-application-token.input';
import { UploadApplicationFileInput } from 'src/engine/core-modules/application/dtos/uploadApplicationFileInput';
import { ApplicationSyncService } from 'src/engine/core-modules/application/services/application-sync.service';
import { ApplicationService } from 'src/engine/core-modules/application/services/application.service';
import { AuthToken } from 'src/engine/core-modules/auth/dto/auth-token.dto';
import { ApplicationTokenService } from 'src/engine/core-modules/auth/token/services/application-token.service';
import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';
import { FileDTO } from 'src/engine/core-modules/file/dtos/file.dto';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { DevelopmentGuard } from 'src/engine/guards/development.guard';
import { RequireFeatureFlag } from 'src/engine/guards/feature-flag.guard';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { WorkspaceMigrationGraphqlApiExceptionInterceptor } from 'src/engine/workspace-manager/workspace-migration/interceptors/workspace-migration-graphql-api-exception.interceptor';
import { streamToBuffer } from 'src/utils/stream-to-buffer';

@UsePipes(ResolverValidationPipe)
@MetadataResolver()
@UseInterceptors(WorkspaceMigrationGraphqlApiExceptionInterceptor)
@UseFilters(ApplicationExceptionFilter)
@UseGuards(
  WorkspaceAuthGuard,
  DevelopmentGuard,
  SettingsPermissionGuard(PermissionFlagType.APPLICATIONS),
)
export class ApplicationDevelopmentResolver {
  constructor(
    private readonly applicationTokenService: ApplicationTokenService,
    private readonly applicationSyncService: ApplicationSyncService,
    private readonly applicationService: ApplicationService,
    private readonly fileStorageService: FileStorageService,
  ) {}

  @Mutation(() => AuthToken)
  @RequireFeatureFlag(FeatureFlagKey.IS_APPLICATION_ENABLED)
  async generateApplicationToken(
    @Args() { applicationId }: GenerateApplicationTokenInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<AuthToken> {
    return this.applicationTokenService.generateApplicationAccessToken({
      workspaceId,
      applicationId,
    });
  }

  @Mutation(() => Boolean)
  @RequireFeatureFlag(FeatureFlagKey.IS_APPLICATION_ENABLED)
  async syncApplication(
    @Args() { manifest }: ApplicationInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ) {
    await this.applicationSyncService.synchronizeFromManifest({
      workspaceId,
      manifest,
    });

    return true;
  }

  @Mutation(() => ApplicationDTO)
  @RequireFeatureFlag(FeatureFlagKey.IS_APPLICATION_ENABLED)
  async createOneApplication(
    @Args('input') input: CreateApplicationInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ) {
    return await this.applicationService.create({
      ...input,
      sourceType: 'local',
      workspaceId,
    });
  }

  @Mutation(() => FileDTO)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.UPLOAD_FILE))
  @RequireFeatureFlag(FeatureFlagKey.IS_APPLICATION_ENABLED)
  async uploadApplicationFile(
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @Args({ name: 'file', type: () => GraphQLUpload })
    { createReadStream, mimetype }: FileUpload,
    @Args()
    {
      applicationUniversalIdentifier,
      fileFolder,
      filePath,
    }: UploadApplicationFileInput,
  ): Promise<FileDTO> {
    const allowedApplicationFileFolders: FileFolder[] = [
      FileFolder.BuiltLogicFunction,
      FileFolder.BuiltFrontComponent,
      FileFolder.PublicAsset,
      FileFolder.Source,
      FileFolder.Dependencies,
    ];

    if (!allowedApplicationFileFolders.includes(fileFolder)) {
      throw new ApplicationException(
        `Invalid fileFolder for application file upload. Allowed values: ${allowedApplicationFileFolders.join(', ')}`,
        ApplicationExceptionCode.INVALID_INPUT,
      );
    }

    const buffer = await streamToBuffer(createReadStream());

    return await this.fileStorageService.writeFile({
      sourceFile: buffer,
      mimeType: mimetype,
      fileFolder,
      applicationUniversalIdentifier,
      workspaceId,
      resourcePath: filePath,
      settings: { isTemporaryFile: false, toDelete: false },
    });
  }
}
