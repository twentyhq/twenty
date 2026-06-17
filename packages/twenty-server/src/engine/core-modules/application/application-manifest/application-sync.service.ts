import { Inject, Injectable, Logger } from '@nestjs/common';

import { type Manifest } from 'twenty-shared/application';
import { ALL_METADATA_NAME } from 'twenty-shared/metadata';
import { FileFolder } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { PackageJson } from 'type-fest';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import { ApplicationManifestMigrationService } from 'src/engine/core-modules/application/application-manifest/application-manifest-migration.service';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { LOGIC_FUNCTION_DRIVER_FACTORY_TOKEN } from 'src/engine/core-modules/logic-function/logic-function-drivers/constants/logic-function-driver-factory.token';
import { type LogicFunctionDriverFactory } from 'src/engine/core-modules/logic-function/logic-function-drivers/logic-function-driver.factory';
import { buildFromToAllUniversalFlatEntityMaps } from 'src/engine/core-modules/application/application-manifest/utils/build-from-to-all-universal-flat-entity-maps.util';
import { getApplicationSubAllFlatEntityMaps } from 'src/engine/core-modules/application/application-manifest/utils/get-application-sub-all-flat-entity-maps.util';
import { FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';
import { createEmptyAllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-all-flat-entity-maps.constant';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';
import { WorkspaceMigration } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/workspace-migration.type';
import { streamToBuffer } from 'src/utils/stream-to-buffer';

@Injectable()
export class ApplicationSyncService {
  private readonly logger = new Logger(ApplicationSyncService.name);

  constructor(
    private readonly applicationService: ApplicationService,
    private readonly applicationManifestMigrationService: ApplicationManifestMigrationService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly fileStorageService: FileStorageService,
    @Inject(LOGIC_FUNCTION_DRIVER_FACTORY_TOKEN)
    private readonly logicFunctionDriverFactory: LogicFunctionDriverFactory,
  ) {}

  public async synchronizeFromManifest({
    workspaceId,
    manifest,
    applicationRegistrationId,
    dryRun = false,
  }: {
    workspaceId: string;
    manifest: Manifest;
    applicationRegistrationId?: string;
    dryRun?: boolean;
  }): Promise<{
    workspaceMigration: WorkspaceMigration;
    hasSchemaMetadataChanged: boolean;
  }> {
    const ownerFlatApplication: FlatApplication = dryRun
      ? await this.findInstalledApplicationOrThrow({ workspaceId, manifest })
      : await this.syncApplication({
          workspaceId,
          manifest,
          applicationRegistrationId,
        });

    const syncResult =
      await this.applicationManifestMigrationService.syncMetadataFromManifest({
        manifest,
        workspaceId,
        ownerFlatApplication,
        dryRun,
      });

    this.logger.log(
      `Application sync from manifest ${dryRun ? 'plan computed (dry run)' : 'completed'}`,
    );

    return syncResult;
  }

  private async findInstalledApplicationOrThrow({
    workspaceId,
    manifest,
  }: {
    workspaceId: string;
    manifest: Manifest;
  }): Promise<ApplicationEntity> {
    const application = await this.applicationService.findByUniversalIdentifier(
      {
        universalIdentifier: manifest.application.universalIdentifier,
        workspaceId,
      },
    );

    if (!application) {
      throw new ApplicationException(
        `Application "${manifest.application.universalIdentifier}" is not installed in workspace "${workspaceId}". Install it first.`,
        ApplicationExceptionCode.APP_NOT_INSTALLED,
      );
    }

    return application;
  }

  // Registers the application + only the pre-install logic function in
  // workspace metadata so the pre-install hook can resolve and execute it
  // before the main synchronizeFromManifest runs the full migrations.
  // No-op when the manifest does not declare a pre-install logic function.
  public async preInstallSynchronizeFromManifest({
    workspaceId,
    manifest,
    applicationRegistrationId,
  }: {
    workspaceId: string;
    manifest: Manifest;
    applicationRegistrationId?: string;
  }): Promise<void> {
    if (!isDefined(manifest.application.preInstallLogicFunction)) {
      return;
    }

    const application = await this.syncApplication({
      workspaceId,
      manifest,
      applicationRegistrationId,
    });

    const ownerFlatApplication: FlatApplication = application;

    await this.applicationManifestMigrationService.syncPreInstallLogicFunctionFromManifest(
      {
        manifest,
        workspaceId,
        ownerFlatApplication,
      },
    );

    this.logger.log('Pre-install sync from manifest completed');
  }

  private async syncApplication({
    workspaceId,
    manifest,
    applicationRegistrationId,
  }: {
    workspaceId: string;
    manifest: Manifest;
    applicationRegistrationId?: string;
  }): Promise<ApplicationEntity> {
    const name = manifest.application.displayName;
    const packageJson = JSON.parse(
      (
        await streamToBuffer(
          await this.fileStorageService.readFile({
            applicationUniversalIdentifier:
              manifest.application.universalIdentifier,
            fileFolder: FileFolder.Dependencies,
            resourcePath: 'package.json',
            workspaceId,
          }),
        )
      ).toString('utf-8'),
    ) as PackageJson;

    const application = await this.applicationService.findOneApplicationOrThrow(
      {
        universalIdentifier: manifest.application.universalIdentifier,
        workspaceId,
      },
    );

    const resolvedRegistrationId =
      applicationRegistrationId ?? application.applicationRegistrationId;

    return await this.applicationService.update(application.id, {
      name,
      description: manifest.application.description,
      logo: manifest.application.logoUrl ?? null,
      version: packageJson.version,
      packageJsonChecksum: manifest.application.packageJsonChecksum,
      yarnLockChecksum: manifest.application.yarnLockChecksum,
      applicationRegistrationId: resolvedRegistrationId,
      workspaceId,
    });
  }

  public async uninstallApplication({
    workspaceId,
    applicationUniversalIdentifier,
  }: {
    workspaceId: string;
    applicationUniversalIdentifier: string;
  }): Promise<WorkspaceMigration> {
    const application = await this.applicationService.findOneApplicationOrThrow(
      { universalIdentifier: applicationUniversalIdentifier, workspaceId },
    );

    if (!application.canBeUninstalled) {
      throw new ApplicationException(
        'This application cannot be uninstalled.',
        ApplicationExceptionCode.FORBIDDEN,
      );
    }

    const flatEntityMapsCacheKeys = Object.values(ALL_METADATA_NAME).map(
      getMetadataFlatEntityMapsKey,
    );

    const cacheResult = await this.workspaceCacheService.getOrRecompute(
      workspaceId,
      [...flatEntityMapsCacheKeys, 'featureFlagsMap'],
    );

    const { featureFlagsMap, ...fromAllFlatEntityMaps } = cacheResult;

    const applicationFromAllFlatEntityMaps = getApplicationSubAllFlatEntityMaps(
      {
        applicationIds: [application.id],
        fromAllFlatEntityMaps,
      },
    );

    const fromToAllFlatEntityMaps = buildFromToAllUniversalFlatEntityMaps({
      fromAllFlatEntityMaps: applicationFromAllFlatEntityMaps,
      toAllUniversalFlatEntityMaps: createEmptyAllFlatEntityMaps(),
    });

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigrationFromTo(
        {
          buildOptions: {
            isSystemBuild: true,
            inferDeletionFromMissingEntities: true,
            applicationUniversalIdentifier,
          },
          fromToAllFlatEntityMaps,
          workspaceId,
          additionalCacheDataMaps: { featureFlagsMap },
        },
      );

    if (validateAndBuildResult.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(
        validateAndBuildResult,
        'Validation errors occurred while uninstalling application',
      );
    }

    await this.applicationService.delete(
      applicationUniversalIdentifier,
      workspaceId,
    );

    await this.cleanupApplicationRuntimeResources({
      workspaceId,
      applicationUniversalIdentifier,
    });

    return validateAndBuildResult.workspaceMigration;
  }

  // Best-effort cleanup of app-scoped runtime resources that live outside the
  // database / file storage (e.g. the Lambda SDK layer). Per-function resources
  // (the Lambda functions themselves) are released by the logic-function delete
  // action handler during the from→empty migration above. This runs after
  // metadata deletion so an external failure can never wedge the uninstall.
  // The shared, content-addressed deps layer is intentionally NOT deleted here:
  // it is shared across apps/workspaces with the same yarn.lock and left to GC.
  private async cleanupApplicationRuntimeResources({
    workspaceId,
    applicationUniversalIdentifier,
  }: {
    workspaceId: string;
    applicationUniversalIdentifier: string;
  }): Promise<void> {
    try {
      const driver = this.logicFunctionDriverFactory.getCurrentDriver();

      await driver.deleteApplicationResources({
        workspaceId,
        applicationUniversalIdentifier,
      });
    } catch (error) {
      this.logger.warn(
        `Failed to clean up runtime resources for application ${applicationUniversalIdentifier} in workspace ${workspaceId}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}
