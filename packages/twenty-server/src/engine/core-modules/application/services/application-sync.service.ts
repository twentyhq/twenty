import { Injectable, Logger } from '@nestjs/common';

import { FileFolder } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { PackageJson } from 'type-fest';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import { ApplicationInput } from 'src/engine/core-modules/application/dtos/application.input';
import { ApplicationManifestMigrationService } from 'src/engine/core-modules/application/services/application-manifest-migration.service';
import { ApplicationService } from 'src/engine/core-modules/application/services/application.service';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { getDefaultApplicationPackageFields } from 'src/engine/core-modules/application-layer/utils/get-default-application-package-fields.util';
import { ApplicationVariableEntityService } from 'src/engine/core-modules/applicationVariable/application-variable.service';
import { FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { findFlatEntitiesByApplicationId } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entities-by-application-id.util';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';
import { streamToBuffer } from 'src/utils/stream-to-buffer';

@Injectable()
export class ApplicationSyncService {
  private readonly logger = new Logger(ApplicationSyncService.name);

  constructor(
    private readonly applicationService: ApplicationService,
    private readonly applicationVariableService: ApplicationVariableEntityService,
    private readonly applicationManifestMigrationService: ApplicationManifestMigrationService,
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly fileStorageService: FileStorageService,
  ) {}

  public async synchronizeFromManifest({
    workspaceId,
    manifest,
  }: ApplicationInput & {
    workspaceId: string;
  }) {
    const application = await this.syncApplication({
      workspaceId,
      manifest,
    });

    const ownerFlatApplication: FlatApplication = application;

    await this.applicationManifestMigrationService.syncMetadataFromManifest({
      manifest,
      workspaceId,
      ownerFlatApplication,
    });

    this.logger.log('✅ Application sync from manifest completed');
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

    return await this.applicationService.update(application.id, {
      name,
      description: manifest.application.description,
      version: packageJson.version,
      packageJsonChecksum: manifest.application.packageJsonChecksum,
      yarnLockChecksum: manifest.application.yarnLockChecksum,
      //availablePackages: manifest.application.availablePackages, // TODO: compute available package in dev-mode-orchestrator
    });
  }

  public async uninstallApplication({
    workspaceId,
    applicationUniversalIdentifier,
  }: {
    workspaceId: string;
    applicationUniversalIdentifier: string;
  }) {
    const {
      flatObjectMetadataMaps: existingFlatObjectMetadataMaps,
      flatIndexMaps: existingFlatIndexMetadataMaps,
      flatFieldMetadataMaps: existingFlatFieldMetadataMaps,
      flatFrontComponentMaps: existingFlatFrontComponentMaps,
      flatLogicFunctionMaps: existingFlatLogicFunctionMaps,
      flatRoleMaps: existingFlatRoleMaps,
    } = await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
      {
        workspaceId,
        flatMapsKeys: [
          'flatObjectMetadataMaps',
          'flatIndexMaps',
          'flatFieldMetadataMaps',
          'flatFrontComponentMaps',
          'flatLogicFunctionMaps',
          'flatRoleMaps',
        ],
      },
    );

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

    const flatObjectMetadataMapsByApplicationId =
      findFlatEntitiesByApplicationId({
        flatEntityMaps: existingFlatObjectMetadataMaps,
        applicationId: application.id,
      });

    const flatIndexMetadataMapsByApplicationId =
      findFlatEntitiesByApplicationId({
        flatEntityMaps: existingFlatIndexMetadataMaps,
        applicationId: application.id,
      });

    const flatFieldMetadataMapsByApplicationId =
      findFlatEntitiesByApplicationId({
        flatEntityMaps: existingFlatFieldMetadataMaps,
        applicationId: application.id,
      });

    const flatFrontComponentMapsByApplicationId =
      findFlatEntitiesByApplicationId({
        flatEntityMaps: existingFlatFrontComponentMaps,
        applicationId: application.id,
      });

    const flatLogicFunctionMapsByApplicationId =
      findFlatEntitiesByApplicationId({
        flatEntityMaps: existingFlatLogicFunctionMaps,
        applicationId: application.id,
      });

    const flatRoleMapsByApplicationId = findFlatEntitiesByApplicationId({
      flatEntityMaps: existingFlatRoleMaps,
      applicationId: application.id,
    });

    await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
      {
        allFlatEntityOperationByMetadataName: {
          objectMetadata: {
            flatEntityToCreate: [],
            flatEntityToDelete: flatObjectMetadataMapsByApplicationId,
            flatEntityToUpdate: [],
          },
          index: {
            flatEntityToCreate: [],
            flatEntityToDelete: flatIndexMetadataMapsByApplicationId,
            flatEntityToUpdate: [],
          },
          fieldMetadata: {
            flatEntityToCreate: [],
            flatEntityToDelete: flatFieldMetadataMapsByApplicationId,
            flatEntityToUpdate: [],
          },
          frontComponent: {
            flatEntityToCreate: [],
            flatEntityToDelete: flatFrontComponentMapsByApplicationId,
            flatEntityToUpdate: [],
          },
          logicFunction: {
            flatEntityToCreate: [],
            flatEntityToDelete: flatLogicFunctionMapsByApplicationId,
            flatEntityToUpdate: [],
          },
          role: {
            flatEntityToCreate: [],
            flatEntityToDelete: flatRoleMapsByApplicationId,
            flatEntityToUpdate: [],
          },
        },
        workspaceId,
        isSystemBuild: true,
        applicationUniversalIdentifier,
      },
    );

    await this.applicationService.delete(
      applicationUniversalIdentifier,
      workspaceId,
    );
  }
}
