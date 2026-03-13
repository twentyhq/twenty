import {
  UseFilters,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { Args, Mutation } from '@nestjs/graphql';

import { printSchema } from 'graphql';
import GraphQLUpload from 'graphql-upload/GraphQLUpload.mjs';
import { PermissionFlagType } from 'twenty-shared/constants';
import { FeatureFlagKey, FileFolder } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import type { FileUpload } from 'graphql-upload/processRequest.mjs';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { WorkspaceSchemaFactory } from 'src/engine/api/graphql/workspace-schema.factory';
import { ApplicationInput } from 'src/engine/core-modules/application/application-development/dtos/application.input';
import { CreateDevelopmentApplicationInput } from 'src/engine/core-modules/application/application-development/dtos/create-development-application.input';
import { DevelopmentApplicationDTO } from 'src/engine/core-modules/application/application-development/dtos/development-application.dto';
import { GenerateApplicationTokenInput } from 'src/engine/core-modules/application/application-development/dtos/generate-application-token.input';
import { UploadApplicationFileInput } from 'src/engine/core-modules/application/application-development/dtos/upload-application-file.input';
import { WorkspaceMigrationDTO } from 'src/engine/core-modules/application/application-development/dtos/workspace-migration.dto';
import { ApplicationExceptionFilter } from 'src/engine/core-modules/application/application-exception-filter';
import { ApplicationSyncService } from 'src/engine/core-modules/application/application-manifest/application-sync.service';
import { ApplicationTokenPairDTO } from 'src/engine/core-modules/application/application-oauth/dtos/application-token-pair.dto';
import { ApplicationRegistrationVariableService } from 'src/engine/core-modules/application/application-registration-variable/application-registration-variable.service';
import { ApplicationRegistrationService } from 'src/engine/core-modules/application/application-registration/application-registration.service';
import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { ApplicationTokenService } from 'src/engine/core-modules/auth/token/services/application-token.service';
import { FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';
import { FileDTO } from 'src/engine/core-modules/file/dtos/file.dto';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { SdkClientGenerationService } from 'src/engine/core-modules/logic-function/logic-function-resource/sdk-client-generation.service';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { DevelopmentGuard } from 'src/engine/guards/development.guard';
import {
  FeatureFlagGuard,
  RequireFeatureFlag,
} from 'src/engine/guards/feature-flag.guard';
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
  FeatureFlagGuard,
  DevelopmentGuard,
  SettingsPermissionGuard(PermissionFlagType.APPLICATIONS),
)
export class ApplicationDevelopmentResolver {
  constructor(
    private readonly applicationTokenService: ApplicationTokenService,
    private readonly applicationService: ApplicationService,
    private readonly applicationSyncService: ApplicationSyncService,
    private readonly applicationRegistrationService: ApplicationRegistrationService,
    private readonly applicationRegistrationVariableService: ApplicationRegistrationVariableService,
    private readonly fileStorageService: FileStorageService,
    private readonly sdkClientGenerationService: SdkClientGenerationService,
    private readonly workspaceSchemaFactory: WorkspaceSchemaFactory,
  ) {}

  @Mutation(() => DevelopmentApplicationDTO)
  @RequireFeatureFlag(FeatureFlagKey.IS_APPLICATION_ENABLED)
  async createDevelopmentApplication(
    @Args() { universalIdentifier, name }: CreateDevelopmentApplicationInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<DevelopmentApplicationDTO> {
    const applicationRegistrationId = await this.findApplicationRegistrationId(
      universalIdentifier,
      workspaceId,
    );

    const existing = await this.applicationService.findByUniversalIdentifier({
      universalIdentifier,
      workspaceId,
    });

    if (existing) {
      return {
        id: existing.id,
        universalIdentifier: existing.universalIdentifier,
      };
    }

    const application = await this.applicationService.create({
      universalIdentifier,
      name,
      sourcePath: universalIdentifier,
      sourceType: ApplicationRegistrationSourceType.LOCAL,
      applicationRegistrationId,
      workspaceId,
    });

    return {
      id: application.id,
      universalIdentifier: application.universalIdentifier,
    };
  }

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
    const applicationRegistrationId = await this.findApplicationRegistrationId(
      manifest.application.universalIdentifier,
      workspaceId,
    );

    const application =
      await this.applicationService.findByUniversalIdentifier({
        universalIdentifier: manifest.application.universalIdentifier,
        workspaceId,
      });

    if (!isDefined(application)) {
      throw new ApplicationException(
        `Application "${manifest.application.universalIdentifier}" not found in workspace "${workspaceId}". Run createDevelopmentApplication first.`,
        ApplicationExceptionCode.APPLICATION_NOT_FOUND,
      );
    }

    const isFirstSync = !isDefined(application.version);

    const { workspaceMigration, hasSchemaMetadataChanged } =
      await this.applicationSyncService.synchronizeFromManifest({
        workspaceId,
        manifest,
        applicationRegistrationId,
      });

    if (isFirstSync || hasSchemaMetadataChanged) {
      const graphqlSchema =
        await this.workspaceSchemaFactory.createGraphQLSchema(
          { id: workspaceId } as WorkspaceEntity,
          application.id,
        );

      await this.sdkClientGenerationService.generateApplicationClient({
        workspaceId,
        applicationId: application.id,
        applicationUniversalIdentifier:
          manifest.application.universalIdentifier,
        schema: printSchema(graphqlSchema),
      });
    }

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

  private async findApplicationRegistrationId(
    universalIdentifier: string,
    workspaceId: string,
  ): Promise<string> {
    const existingRegistration =
      await this.applicationRegistrationService.findOneByUniversalIdentifier(
        universalIdentifier,
      );

    if (!existingRegistration) {
      throw new ApplicationException(
        `No registration found for "${universalIdentifier}". Create one first with createApplicationRegistration.`,
        ApplicationExceptionCode.APPLICATION_NOT_FOUND,
      );
    }

    const isOwner =
      await this.applicationRegistrationService.isOwnedByWorkspace(
        existingRegistration.id,
        workspaceId,
      );

    if (!isOwner) {
      throw new ApplicationException(
        'Cannot sync application: registration is owned by another workspace',
        ApplicationExceptionCode.FORBIDDEN,
      );
    }

    return existingRegistration.id;
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

      if (manifest.application.serverVariables) {
        await this.applicationRegistrationVariableService.syncVariableSchemas(
          applicationRegistrationId,
          manifest.application.serverVariables,
        );
      }
    }
  }
}
