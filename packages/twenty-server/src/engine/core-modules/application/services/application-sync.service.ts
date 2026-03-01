import { Injectable, Logger } from '@nestjs/common';

import { ALL_METADATA_NAME } from 'twenty-shared/metadata';
import { FileFolder } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { PackageJson } from 'type-fest';

import { ApplicationRegistrationVariableService } from 'src/engine/core-modules/application-registration/application-registration-variable.service';
import { ApplicationRegistrationService } from 'src/engine/core-modules/application-registration/application-registration.service';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import { ApplicationInput } from 'src/engine/core-modules/application/dtos/application.input';
import { ApplicationManifestMigrationService } from 'src/engine/core-modules/application/services/application-manifest-migration.service';
import { ApplicationService } from 'src/engine/core-modules/application/services/application.service';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { buildFromToAllUniversalFlatEntityMaps } from 'src/engine/core-modules/application/utils/build-from-to-all-universal-flat-entity-maps.util';
import { getApplicationSubAllFlatEntityMaps } from 'src/engine/core-modules/application/utils/get-application-sub-all-flat-entity-maps.util';
import { getDefaultApplicationPackageFields } from 'src/engine/core-modules/application/utils/get-default-application-package-fields.util';
import { ApplicationVariableEntityService } from 'src/engine/core-modules/applicationVariable/application-variable.service';
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
    private readonly applicationVariableService: ApplicationVariableEntityService,
    private readonly applicationManifestMigrationService: ApplicationManifestMigrationService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly fileStorageService: FileStorageService,
    private readonly applicationRegistrationService: ApplicationRegistrationService,
    private readonly applicationRegistrationVariableService: ApplicationRegistrationVariableService,
  ) {}

  public async synchronizeFromManifest({
    workspaceId,
    manifest,
  }: ApplicationInput & {
    workspaceId: string;
  }): Promise<WorkspaceMigration> {
    const application = await this.syncApplication({
      workspaceId,
      manifest,
    });

    const ownerFlatApplication: FlatApplication = application;

    const workspaceMigration =
      await this.applicationManifestMigrationService.syncMetadataFromManifest({
        manifest,
        workspaceId,
        ownerFlatApplication,
      });

    this.logger.log('✅ Application sync from manifest completed');

    return workspaceMigration;
  }

  private async syncApplication({
    workspaceId,
    manifest,
  }: ApplicationInput & {
    workspaceId: string;
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

    const defaultPackageFields = await getDefaultApplicationPackageFields();

    let application = await this.applicationService.findByUniversalIdentifier({
      universalIdentifier: manifest.application.universalIdentifier,
      workspaceId,
    });

    if (!application) {
      application = await this.applicationService.create({
        universalIdentifier: manifest.application.universalIdentifier,
        name,
        description: manifest.application.description,
        version: packageJson.version,
        sourcePath: 'cli-sync', // Placeholder for CLI-synced apps
        defaultRoleId: null,
        workspaceId,
        packageJsonChecksum: defaultPackageFields.packageJsonChecksum,
        packageJsonFileId: null,
        yarnLockChecksum: defaultPackageFields.yarnLockChecksum,
        yarnLockFileId: null,
        availablePackages: defaultPackageFields.availablePackages,
      });
    }

    await this.applicationVariableService.upsertManyApplicationVariableEntities(
      {
        applicationVariables: manifest.application.applicationVariables,
        applicationId: application.id,
        workspaceId,
      },
    );

    const applicationRegistrationMetadata = {
      name,
      description: manifest.application.description,
      logoUrl: manifest.application.logoUrl,
      author: manifest.application.author,
      websiteUrl: manifest.application.websiteUrl,
      termsUrl: manifest.application.termsUrl,
    };

    const applicationRegistrationId =
      await this.resolveApplicationRegistrationId(
        application.applicationRegistrationId,
        manifest.application.universalIdentifier,
        applicationRegistrationMetadata,
      );

    await this.applicationRegistrationService.update({
      id: applicationRegistrationId,
      update: applicationRegistrationMetadata,
    });

    if (manifest.application.serverVariables) {
      await this.applicationRegistrationVariableService.syncVariableSchemas(
        applicationRegistrationId,
        manifest.application.serverVariables,
      );
    }

    return await this.applicationService.update(application.id, {
      name,
      description: manifest.application.description,
      version: packageJson.version,
      packageJsonChecksum: manifest.application.packageJsonChecksum,
      yarnLockChecksum: manifest.application.yarnLockChecksum,
      applicationRegistrationId,
    });
  }

  public async uninstallApplication({
    workspaceId,
    applicationUniversalIdentifier,
  }: {
    workspaceId: string;
    applicationUniversalIdentifier: string;
  }): Promise<WorkspaceMigration> {
    const application = await this.applicationService.findByUniversalIdentifier(
      { universalIdentifier: applicationUniversalIdentifier, workspaceId },
    );

    if (!isDefined(application)) {
      throw new ApplicationException(
        `Application with universalIdentifier ${applicationUniversalIdentifier} not found`,
        ApplicationExceptionCode.ENTITY_NOT_FOUND,
      );
    }

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

    return validateAndBuildResult.workspaceMigration;
  }

  private async resolveApplicationRegistrationId(
    existingId: string | null,
    universalIdentifier: string,
    metadata: {
      name: string;
      description?: string;
      logoUrl?: string;
      author?: string;
      websiteUrl?: string;
      termsUrl?: string;
    },
  ): Promise<string> {
    if (existingId) {
      return existingId;
    }

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
        null,
      );

    this.logger.log(
      `Created app registration for ${metadata.name} (${universalIdentifier})`,
    );

    return newRegistration.id;
  }
}
