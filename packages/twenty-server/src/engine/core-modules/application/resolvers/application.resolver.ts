import {
  UseFilters,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import GraphQLUpload from 'graphql-upload/GraphQLUpload.mjs';
import { PermissionFlagType } from 'twenty-shared/constants';
import { FileFolder } from 'twenty-shared/types';

import type { FileUpload } from 'graphql-upload/processRequest.mjs';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { ApplicationExceptionFilter } from 'src/engine/core-modules/application/application-exception-filter';
import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import { ApplicationDTO } from 'src/engine/core-modules/application/dtos/application.dto';
import { ApplicationInput } from 'src/engine/core-modules/application/dtos/application.input';
import { InstallApplicationInput } from 'src/engine/core-modules/application/dtos/install-application.input';
import { UninstallApplicationInput } from 'src/engine/core-modules/application/dtos/uninstallApplicationInput';
import { UploadApplicationFileInput } from 'src/engine/core-modules/application/dtos/uploadApplicationFileInput';
import { ApplicationSyncService } from 'src/engine/core-modules/application/services/application-sync.service';
import { ApplicationService } from 'src/engine/core-modules/application/services/application.service';
import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';
import { FileDTO } from 'src/engine/core-modules/file/dtos/file.dto';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { RequireFeatureFlag } from 'src/engine/guards/feature-flag.guard';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationGraphqlApiExceptionInterceptor } from 'src/engine/workspace-manager/workspace-migration/interceptors/workspace-migration-graphql-api-exception.interceptor';
import { WorkspaceMigrationRunnerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/services/workspace-migration-runner.service';
import { streamToBuffer } from 'src/utils/stream-to-buffer';
import { CreateApplicationInput } from 'src/engine/core-modules/application/dtos/create-application.input';

@UseGuards(
  WorkspaceAuthGuard,
  SettingsPermissionGuard(PermissionFlagType.APPLICATIONS),
)
@UsePipes(ResolverValidationPipe)
@Resolver()
@UseInterceptors(WorkspaceMigrationGraphqlApiExceptionInterceptor)
@UseFilters(ApplicationExceptionFilter)
export class ApplicationResolver {
  constructor(
    private readonly workspaceMigrationRunnerService: WorkspaceMigrationRunnerService,
    private readonly applicationSyncService: ApplicationSyncService,
    private readonly applicationService: ApplicationService,
    private readonly fileStorageService: FileStorageService,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {}

  @Query(() => [ApplicationDTO])
  @RequireFeatureFlag(FeatureFlagKey.IS_APPLICATION_ENABLED)
  async findManyApplications(
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ) {
    return this.applicationService.findManyApplications(workspaceId);
  }

  @Query(() => Boolean)
  @RequireFeatureFlag(FeatureFlagKey.IS_APPLICATION_ENABLED)
  async checkApplicationExist(
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @Args('id', { type: () => UUIDScalarType, nullable: true }) id?: string,
    @Args('universalIdentifier', { type: () => UUIDScalarType, nullable: true })
    universalIdentifier?: string,
  ) {
    return await this.applicationService.checkApplicationExist({
      id,
      universalIdentifier,
      workspaceId,
    });
  }

  @Query(() => ApplicationDTO)
  @RequireFeatureFlag(FeatureFlagKey.IS_APPLICATION_ENABLED)
  async findOneApplication(
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @Args('id', { type: () => UUIDScalarType, nullable: true }) id?: string,
    @Args('universalIdentifier', { type: () => UUIDScalarType, nullable: true })
    universalIdentifier?: string,
  ) {
    return await this.applicationService.findOneApplicationOrThrow({
      id,
      universalIdentifier,
      workspaceId,
    });
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

  @Mutation(() => Boolean)
  @RequireFeatureFlag(FeatureFlagKey.IS_APPLICATION_ENABLED)
  async installApplication(
    @Args() { workspaceMigration: { actions } }: InstallApplicationInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ) {
    const { featureFlagsMap } = await this.workspaceCacheService.getOrRecompute(
      workspaceId,
      ['featureFlagsMap'],
    );

    if (
      featureFlagsMap[
        FeatureFlagKey.IS_APPLICATION_INSTALLATION_FROM_TARBALL_ENABLED
      ] !== true
    ) {
      throw new ApplicationException(
        'Application installation from tarball is not enabled',
        ApplicationExceptionCode.FORBIDDEN,
      );
    }

    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        {
          workspaceId,
        },
      );

    await this.workspaceMigrationRunnerService.run({
      actions,
      workspaceId,
      applicationUniversalIdentifier:
        workspaceCustomFlatApplication.universalIdentifier,
    });

    return true;
  }

  @Mutation(() => Boolean)
  @RequireFeatureFlag(FeatureFlagKey.IS_APPLICATION_ENABLED)
  async uninstallApplication(
    @Args() { universalIdentifier }: UninstallApplicationInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ) {
    await this.applicationSyncService.uninstallApplication({
      applicationUniversalIdentifier: universalIdentifier,
      workspaceId,
    });

    return true;
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
