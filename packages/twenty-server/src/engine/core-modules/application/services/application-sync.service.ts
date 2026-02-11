import { Injectable, Logger } from '@nestjs/common';

import { Manifest, RoleManifest } from 'twenty-shared/application';
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
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { FieldPermissionService } from 'src/engine/metadata-modules/object-permission/field-permission/field-permission.service';
import { ObjectPermissionService } from 'src/engine/metadata-modules/object-permission/object-permission.service';
import { PermissionFlagService } from 'src/engine/metadata-modules/permission-flag/permission-flag.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
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
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly objectPermissionService: ObjectPermissionService,
    private readonly fieldPermissionService: FieldPermissionService,
    private readonly permissionService: PermissionFlagService,
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

    // Delegate all metadata migration to the new service
    await this.applicationManifestMigrationService.syncMetadataFromManifest({
      manifest,
      workspaceId,
      ownerFlatApplication,
    });

    // Post-migration: apply role permissions and resolve default role
    await this.syncRolePermissionsAndDefaultRole({
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

  // Resolves role IDs from refreshed cache after migration, applies
  // permissions, and sets the default role on the application entity.
  private async syncRolePermissionsAndDefaultRole({
    manifest,
    workspaceId,
    ownerFlatApplication,
  }: {
    manifest: Manifest;
    workspaceId: string;
    ownerFlatApplication: FlatApplication;
  }) {
    const { flatRoleMaps: refreshedFlatRoleMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatRoleMaps',
      ]);

    let defaultRoleId: string | null = null;

    for (const role of manifest.roles) {
      const flatRole = findFlatEntityByUniversalIdentifier({
        flatEntityMaps: refreshedFlatRoleMaps,
        universalIdentifier: role.universalIdentifier,
      });

      if (!isDefined(flatRole)) {
        throw new ApplicationException(
          `Failed to resolve role for universalIdentifier ${role.universalIdentifier}`,
          ApplicationExceptionCode.ENTITY_NOT_FOUND,
        );
      }

      await this.syncApplicationRolePermissions({
        role,
        workspaceId,
        roleId: flatRole.id,
      });

      if (
        role.universalIdentifier ===
        manifest.application.defaultRoleUniversalIdentifier
      ) {
        defaultRoleId = flatRole.id;
      }
    }

    if (isDefined(defaultRoleId)) {
      await this.applicationService.update(ownerFlatApplication.id, {
        defaultRoleId,
      });
    }
  }

  private async syncApplicationRolePermissions({
    role,
    workspaceId,
    roleId,
  }: {
    role: RoleManifest;
    workspaceId: string;
    roleId: string;
  }) {
    if (
      (role.objectPermissions ?? []).length > 0 ||
      (role.fieldPermissions ?? []).length > 0
    ) {
      const { flatObjectMetadataMaps, flatFieldMetadataMaps } =
        await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
          {
            workspaceId,
            flatMapsKeys: ['flatObjectMetadataMaps', 'flatFieldMetadataMaps'],
          },
        );

      const formattedObjectPermissions = role.objectPermissions
        ?.map((perm) => {
          const flatObjectMetadata = findFlatEntityByUniversalIdentifier({
            flatEntityMaps: flatObjectMetadataMaps,
            universalIdentifier: perm.objectUniversalIdentifier,
          });

          if (!isDefined(flatObjectMetadata)) {
            throw new ApplicationException(
              `Failed to find object with universalIdentifier ${perm.objectUniversalIdentifier}`,
              ApplicationExceptionCode.OBJECT_NOT_FOUND,
            );
          }

          return {
            ...perm,
            objectMetadataId: flatObjectMetadata.id,
          };
        })
        .filter((perm): perm is typeof perm & { objectMetadataId: string } =>
          isDefined(perm.objectMetadataId),
        );

      if (isDefined(formattedObjectPermissions)) {
        await this.objectPermissionService.upsertObjectPermissions({
          workspaceId,
          input: {
            roleId,
            objectPermissions: formattedObjectPermissions,
          },
        });
      }

      const formattedFieldPermissions = role?.fieldPermissions
        ?.map((perm) => {
          const flatObjectMetadata = findFlatEntityByUniversalIdentifier({
            flatEntityMaps: flatObjectMetadataMaps,
            universalIdentifier: perm.objectUniversalIdentifier,
          });

          if (!isDefined(flatObjectMetadata)) {
            throw new ApplicationException(
              `Failed to find object with universalIdentifier ${perm.objectUniversalIdentifier}`,
              ApplicationExceptionCode.OBJECT_NOT_FOUND,
            );
          }

          const flatFieldMetadata = findFlatEntityByUniversalIdentifier({
            flatEntityMaps: flatFieldMetadataMaps,
            universalIdentifier: perm.fieldUniversalIdentifier,
          });

          if (!isDefined(flatFieldMetadata)) {
            throw new ApplicationException(
              `Failed to find field with universalIdentifier ${perm.fieldUniversalIdentifier}`,
              ApplicationExceptionCode.FIELD_NOT_FOUND,
            );
          }

          return {
            ...perm,
            objectMetadataId: flatObjectMetadata.id,
            fieldMetadataId: flatFieldMetadata.id,
          };
        })
        .filter(
          (
            perm,
          ): perm is typeof perm & {
            objectMetadataId: string;
            fieldMetadataId: string;
          } =>
            isDefined(perm.objectMetadataId) && isDefined(perm.fieldMetadataId),
        );

      if (isDefined(formattedFieldPermissions)) {
        await this.fieldPermissionService.upsertFieldPermissions({
          workspaceId,
          input: {
            roleId,
            fieldPermissions: formattedFieldPermissions,
          },
        });
      }
    }

    if (isDefined(role?.permissionFlags) && role.permissionFlags.length > 0) {
      await this.permissionService.upsertPermissionFlags({
        workspaceId,
        input: {
          roleId,
          permissionFlagKeys: role.permissionFlags,
        },
      });
    }
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
