import { Injectable, Logger } from '@nestjs/common';

import { type Manifest, type RoleManifest } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import { APPLICATION_MANIFEST_METADATA_NAMES } from 'src/engine/core-modules/application/constants/application-manifest-metadata-names.constant';
import { ApplicationService } from 'src/engine/core-modules/application/services/application.service';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { computeApplicationManifestAllUniversalFlatEntityMaps } from 'src/engine/core-modules/application/utils/compute-application-manifest-all-universal-flat-entity-maps.util';
import { getSubApplicationFromToAllFlatEntityMaps } from 'src/engine/core-modules/application/utils/get-sub-application-from-to-all-flat-entity-maps.util';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';
import { FieldPermissionService } from 'src/engine/metadata-modules/object-permission/field-permission/field-permission.service';
import { ObjectPermissionService } from 'src/engine/metadata-modules/object-permission/object-permission.service';
import { PermissionFlagService } from 'src/engine/metadata-modules/permission-flag/permission-flag.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';
import { WorkspaceMigration } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/workspace-migration.type';

@Injectable()
export class ApplicationManifestMigrationService {
  private readonly logger = new Logger(
    ApplicationManifestMigrationService.name,
  );

  constructor(
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly applicationService: ApplicationService,
    private readonly objectPermissionService: ObjectPermissionService,
    private readonly fieldPermissionService: FieldPermissionService,
    private readonly permissionFlagService: PermissionFlagService,
  ) {}

  async syncMetadataFromManifest({
    manifest,
    workspaceId,
    ownerFlatApplication,
  }: {
    manifest: Manifest;
    workspaceId: string;
    ownerFlatApplication: FlatApplication;
  }): Promise<WorkspaceMigration> {
    const now = new Date().toISOString();

    const toAllUniversalFlatEntityMaps =
      computeApplicationManifestAllUniversalFlatEntityMaps({
        manifest,
        applicationUniversalIdentifier:
          ownerFlatApplication.universalIdentifier,
        now,
      });

    const cacheResult = await this.workspaceCacheService.getOrRecompute(
      workspaceId,
      [
        ...APPLICATION_MANIFEST_METADATA_NAMES.map(
          getMetadataFlatEntityMapsKey,
        ),
        'featureFlagsMap',
      ],
    );

    const { featureFlagsMap, ...fromAllFlatEntityMaps } = cacheResult;

    const fromToAllFlatEntityMaps = getSubApplicationFromToAllFlatEntityMaps({
      applicationId: ownerFlatApplication.id,
      fromAllFlatEntityMaps,
      toAllUniversalFlatEntityMaps,
    });

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigrationFromTo(
        {
          buildOptions: {
            isSystemBuild: false,
            inferDeletionFromMissingEntities: true,
            applicationUniversalIdentifier:
              ownerFlatApplication.universalIdentifier,
          },
          fromToAllFlatEntityMaps,
          workspaceId,
          additionalCacheDataMaps: { featureFlagsMap },
        },
      );

    if (validateAndBuildResult.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(
        validateAndBuildResult,
        'Validation errors occurred while syncing application manifest metadata',
      );
    }

    this.logger.log(
      `Metadata migration completed for application ${ownerFlatApplication.universalIdentifier}`,
    );

    await this.syncRolePermissionsAndDefaultRole({
      manifest,
      workspaceId,
      ownerFlatApplication,
    });

    return validateAndBuildResult.workspaceMigration;
  }

  /**
   * @deprecated should be remove once below issues are resolved:
   *  - [objectPermission](https://github.com/twentyhq/core-team-issues/issues/2223)
   *  - [fieldPermission](https://github.com/twentyhq/core-team-issues/issues/2224)
   *  - [permissionFlag](https://github.com/twentyhq/core-team-issues/issues/2225)
   */
  private async syncRolePermissionsAndDefaultRole({
    manifest,
    workspaceId,
    ownerFlatApplication,
  }: {
    manifest: Manifest;
    workspaceId: string;
    ownerFlatApplication: FlatApplication;
  }) {
    const {
      flatRoleMaps: refreshedFlatRoleMaps,
      flatObjectMetadataMaps: refreshedFlatObjectMetadataMaps,
      flatFieldMetadataMaps: refreshedFlatFieldMetadataMaps,
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'flatRoleMaps',
      'flatObjectMetadataMaps',
      'flatFieldMetadataMaps',
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
        refreshedFlatObjectMetadataMaps,
        refreshedFlatFieldMetadataMaps,
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
    refreshedFlatObjectMetadataMaps,
    refreshedFlatFieldMetadataMaps,
  }: {
    role: RoleManifest;
    workspaceId: string;
    roleId: string;
    refreshedFlatObjectMetadataMaps: Awaited<
      ReturnType<WorkspaceCacheService['getOrRecompute']>
    >['flatObjectMetadataMaps'];
    refreshedFlatFieldMetadataMaps: Awaited<
      ReturnType<WorkspaceCacheService['getOrRecompute']>
    >['flatFieldMetadataMaps'];
  }) {
    if (
      (role.objectPermissions ?? []).length > 0 ||
      (role.fieldPermissions ?? []).length > 0
    ) {
      const formattedObjectPermissions = role.objectPermissions
        ?.map((permission) => {
          const flatObjectMetadata = findFlatEntityByUniversalIdentifier({
            flatEntityMaps: refreshedFlatObjectMetadataMaps,
            universalIdentifier: permission.objectUniversalIdentifier,
          });

          if (!isDefined(flatObjectMetadata)) {
            throw new ApplicationException(
              `Failed to find object with universalIdentifier ${permission.objectUniversalIdentifier}`,
              ApplicationExceptionCode.OBJECT_NOT_FOUND,
            );
          }

          return {
            ...permission,
            objectMetadataId: flatObjectMetadata.id,
          };
        })
        .filter(
          (
            permission,
          ): permission is typeof permission & { objectMetadataId: string } =>
            isDefined(permission.objectMetadataId),
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

      const formattedFieldPermissions = role.fieldPermissions
        ?.map((permission) => {
          const flatObjectMetadata = findFlatEntityByUniversalIdentifier({
            flatEntityMaps: refreshedFlatObjectMetadataMaps,
            universalIdentifier: permission.objectUniversalIdentifier,
          });

          if (!isDefined(flatObjectMetadata)) {
            throw new ApplicationException(
              `Failed to find object with universalIdentifier ${permission.objectUniversalIdentifier}`,
              ApplicationExceptionCode.OBJECT_NOT_FOUND,
            );
          }

          const flatFieldMetadata = findFlatEntityByUniversalIdentifier({
            flatEntityMaps: refreshedFlatFieldMetadataMaps,
            universalIdentifier: permission.fieldUniversalIdentifier,
          });

          if (!isDefined(flatFieldMetadata)) {
            throw new ApplicationException(
              `Failed to find field with universalIdentifier ${permission.fieldUniversalIdentifier}`,
              ApplicationExceptionCode.FIELD_NOT_FOUND,
            );
          }

          return {
            ...permission,
            objectMetadataId: flatObjectMetadata.id,
            fieldMetadataId: flatFieldMetadata.id,
          };
        })
        .filter(
          (
            permission,
          ): permission is typeof permission & {
            objectMetadataId: string;
            fieldMetadataId: string;
          } =>
            isDefined(permission.objectMetadataId) &&
            isDefined(permission.fieldMetadataId),
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

    if (isDefined(role.permissionFlags) && role.permissionFlags.length > 0) {
      await this.permissionFlagService.upsertPermissionFlags({
        workspaceId,
        input: {
          roleId,
          permissionFlagKeys: role.permissionFlags,
        },
      });
    }
  }
}
