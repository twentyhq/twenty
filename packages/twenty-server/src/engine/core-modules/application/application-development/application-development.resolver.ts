import {
  Logger,
  UseFilters,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { Args, Mutation } from '@nestjs/graphql';

import GraphQLUpload from 'graphql-upload/GraphQLUpload.mjs';
import { PermissionFlagType } from 'twenty-shared/constants';
import { FileFolder, FeatureFlagKey } from 'twenty-shared/types';

import type { FileUpload } from 'graphql-upload/processRequest.mjs';

import { ApplicationRegistrationVariableService } from 'src/engine/core-modules/application/application-registration/application-registration-variable.service';
import { ApplicationRegistrationService } from 'src/engine/core-modules/application/application-registration/application-registration.service';
import { AppRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/app-registration-source-type.enum';
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
import { WorkspaceMigrationDTO } from 'src/engine/core-modules/application/dtos/workspace-migration.dto';
import { ApplicationSyncService } from 'src/engine/core-modules/application/application-install/application-sync.service';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { ApplicationTokenPairDTO } from 'src/engine/core-modules/application/dtos/application-token-pair.dto';
import { ApplicationTokenService } from 'src/engine/core-modules/auth/token/services/application-token.service';
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
  private readonly logger = new Logger(ApplicationDevelopmentResolver.name);

  constructor(
    private readonly applicationTokenService: ApplicationTokenService,
    private readonly applicationSyncService: ApplicationSyncService,
    private readonly applicationService: ApplicationService,
    private readonly applicationRegistrationService: ApplicationRegistrationService,
    private readonly applicationRegistrationVariableService: ApplicationRegistrationVariableService,
    private readonly fileStorageService: FileStorageService,
  ) {}

  @Mutation(() => ApplicationTokenPairDTO)
  @RequireFeatureFlag(FeatureFlagKey.IS_APPLICATION_ENABLED)
  async generateApplicationToken(
    @Args() { applicationId }: GenerateApplicationTokenInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<ApplicationTokenPairDTO> {
    return this.applicationTokenService.generateApplicationTokenPair({
      workspaceId,
      applicationId,
    });
  }

  @Mutation(() => WorkspaceMigrationDTO)
  @RequireFeatureFlag(FeatureFlagKey.IS_APPLICATION_ENABLED)
  async syncApplication(
    @Args() { manifest }: ApplicationInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<WorkspaceMigrationDTO> {
    const applicationRegistrationId =
      await this.resolveApplicationRegistrationId(
        manifest.application.universalIdentifier,
        {
          name: manifest.application.displayName,
          description: manifest.application.description,
          logoUrl: manifest.application.logoUrl,
          author: manifest.application.author,
          websiteUrl: manifest.application.websiteUrl,
          termsUrl: manifest.application.termsUrl,
        },
        workspaceId,
      );

    const workspaceMigration =
      await this.applicationSyncService.synchronizeFromManifest({
        workspaceId,
        manifest,
        applicationRegistrationId,
      });

    await this.syncRegistrationMetadata(
      applicationRegistrationId,
      manifest,
      workspaceId,
    );

    return {
      applicationUniversalIdentifier:
        workspaceMigration.applicationUniversalIdentifier,
      actions: workspaceMigration.actions,
    };
  }

  @Mutation(() => ApplicationDTO)
  @RequireFeatureFlag(FeatureFlagKey.IS_APPLICATION_ENABLED)
  async createOneApplication(
    @Args('input') input: CreateApplicationInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ) {
    return await this.applicationService.create({
      ...input,
      sourceType: AppRegistrationSourceType.LOCAL,
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

  private async resolveApplicationRegistrationId(
    universalIdentifier: string,
    metadata: {
      name: string;
      description?: string;
      logoUrl?: string;
      author?: string;
      websiteUrl?: string;
      termsUrl?: string;
    },
    workspaceId: string,
  ): Promise<string> {
    const existingRegistration =
      await this.applicationRegistrationService.findOneByUniversalIdentifier(
        universalIdentifier,
      );

    if (existingRegistration) {
      return existingRegistration.id;
    }

    const { applicationRegistration: newRegistration } =
      await this.applicationRegistrationService.create(
        { ...metadata, universalIdentifier },
        workspaceId,
        null,
      );

    this.logger.log(
      `Created app registration for ${metadata.name} (${universalIdentifier})`,
    );

    return newRegistration.id;
  }

  private async syncRegistrationMetadata(
    applicationRegistrationId: string,
    manifest: { application: ApplicationInput['manifest']['application'] },
    workspaceId: string,
  ): Promise<void> {
    const isOwner =
      await this.applicationRegistrationService.isOwnedByWorkspace(
        applicationRegistrationId,
        workspaceId,
      );

    if (isOwner) {
      await this.applicationRegistrationService.update(
        {
          id: applicationRegistrationId,
          update: {
            name: manifest.application.displayName,
            description: manifest.application.description,
            logoUrl: manifest.application.logoUrl,
            author: manifest.application.author,
            websiteUrl: manifest.application.websiteUrl,
            termsUrl: manifest.application.termsUrl,
          },
        },
        workspaceId,
      );
    }

    if (manifest.application.serverVariables) {
      await this.applicationRegistrationVariableService.syncVariableSchemas(
        applicationRegistrationId,
        manifest.application.serverVariables,
      );
    }
  }
}
