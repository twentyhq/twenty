import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { type Manifest } from 'twenty-shared/application';
import { ALL_METADATA_NAME } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { ComputeApplicationManifestAllUniversalFlatEntityMapsService } from 'src/engine/core-modules/application/application-manifest/services/compute-application-manifest-all-universal-flat-entity-maps.service';
import { buildAllFlatEntityOperationRecordByMetadataNameFromFromTo } from 'src/engine/core-modules/application/application-manifest/utils/build-all-flat-entity-operation-record-by-metadata-name-from-from-to.util';
import { buildFromToAllUniversalFlatEntityMaps } from 'src/engine/core-modules/application/application-manifest/utils/build-from-to-all-universal-flat-entity-maps.util';
import {
  computeDefaultRelationFieldUniversalIdentifierTakeovers,
  type FieldUniversalIdentifierTakeover,
} from 'src/engine/core-modules/application/application-manifest/utils/compute-default-relation-field-universal-identifier-takeovers.util';
import { getApplicationSubAllFlatEntityMaps } from 'src/engine/core-modules/application/application-manifest/utils/get-application-sub-all-flat-entity-maps.util';
import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { LoggerService } from 'src/engine/core-modules/logger/logger.service';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';
import { getMetadataRelatedMetadataNames } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-related-metadata-names.util';
import { getMetadataSerializedRelationNames } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-serialized-relation-names.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { TWENTY_STANDARD_APPLICATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-standard-applications';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';
import { type MetadataUniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/metadata-universal-flat-entity-maps.type';
import { WorkspaceMigration } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/workspace-migration.type';
import { WorkspaceMigrationRunnerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/services/workspace-migration-runner.service';

@Injectable()
export class ApplicationManifestMigrationService {
  constructor(
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly workspaceMigrationRunnerService: WorkspaceMigrationRunnerService,
    private readonly applicationService: ApplicationService,
    private readonly computeManifestFlatEntityMapsService: ComputeApplicationManifestAllUniversalFlatEntityMapsService,
    private readonly logger: LoggerService,
    @InjectRepository(FieldMetadataEntity)
    private readonly fieldMetadataRepository: Repository<FieldMetadataEntity>,
  ) {}

  async syncPreInstallLogicFunctionFromManifest({
    manifest,
    workspaceId,
    ownerFlatApplication,
  }: {
    manifest: Manifest;
    workspaceId: string;
    ownerFlatApplication: FlatApplication;
  }): Promise<void> {
    const preInstallLogicFunction =
      manifest.application.preInstallLogicFunction;

    if (!isDefined(preInstallLogicFunction)) {
      return;
    }

    const preInstallLogicFunctionManifest = manifest.logicFunctions.find(
      (logicFunction) =>
        logicFunction.universalIdentifier ===
        preInstallLogicFunction.universalIdentifier,
    );

    if (!isDefined(preInstallLogicFunctionManifest)) {
      throw new ApplicationException(
        `Pre-install logic function "${preInstallLogicFunction.universalIdentifier}" is declared on the application manifest but not present in manifest.logicFunctions`,
        ApplicationExceptionCode.ENTITY_NOT_FOUND,
      );
    }

    // Will be sync with inferDeletionFromMissingEntities: false to produces a purely
    // additive migration that registers the pre-install logic function without
    // touching any previously-synced metadata (important on upgrades).
    const preInstallOnlyManifest: Manifest = {
      application: manifest.application,
      objects: [],
      fields: [],
      logicFunctions: [preInstallLogicFunctionManifest],
      frontComponents: [],
      permissionFlags: [],
      roles: [],
      skills: [],
      agents: [],
      publicAssets: [],
      views: [],
      viewFields: [],
      navigationMenuItems: [],
      pageLayouts: [],
      pageLayoutTabs: [],
      commandMenuItems: [],
    };

    const now = new Date().toISOString();

    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const cacheResult = await this.workspaceCacheService.getOrRecompute(
      workspaceId,
      [
        ...Object.values(ALL_METADATA_NAME).map(getMetadataFlatEntityMapsKey),
        'featureFlagsMap',
      ],
    );

    const { featureFlagsMap, ...existingAllFlatEntityMaps } = cacheResult;

    const fromAllFlatEntityMaps = getApplicationSubAllFlatEntityMaps({
      applicationIds: [ownerFlatApplication.id],
      fromAllFlatEntityMaps: existingAllFlatEntityMaps,
    });

    const toAllUniversalFlatEntityMaps =
      this.computeManifestFlatEntityMapsService.compute({
        manifest: preInstallOnlyManifest,
        ownerFlatApplication,
        now,
        workspaceId,
      });

    const dependencyAllFlatEntityMaps = getApplicationSubAllFlatEntityMaps({
      applicationIds:
        ownerFlatApplication.universalIdentifier ===
        TWENTY_STANDARD_APPLICATION.universalIdentifier
          ? [twentyStandardFlatApplication.id]
          : [ownerFlatApplication.id, twentyStandardFlatApplication.id],
      fromAllFlatEntityMaps: existingAllFlatEntityMaps,
    });

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigrationFromTo(
        {
          // inferDeletionFromMissingEntities is intentionally omitted (undefined)
          // so this pared-down sync is purely additive — existing metadata for
          // objects/fields/other logic functions that are absent from
          // preInstallOnlyManifest are left untouched on upgrades.
          buildOptions: {
            isSystemBuild: false,
            applicationUniversalIdentifier:
              ownerFlatApplication.universalIdentifier,
          },
          fromToAllFlatEntityMaps: buildFromToAllUniversalFlatEntityMaps({
            fromAllFlatEntityMaps,
            toAllUniversalFlatEntityMaps,
          }),
          workspaceId,
          dependencyAllFlatEntityMaps,
          additionalCacheDataMaps: { featureFlagsMap },
        },
      );

    if (validateAndBuildResult.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(
        validateAndBuildResult,
        'Validation errors occurred while syncing pre-install logic function',
      );
    }

    this.logger.log(
      `Pre-install logic function synced for application ${ownerFlatApplication.universalIdentifier}`,
      ApplicationManifestMigrationService.name,
    );
  }

  async syncMetadataFromManifest({
    manifest,
    workspaceId,
    ownerFlatApplication,
    dryRun = false,
  }: {
    manifest: Manifest;
    workspaceId: string;
    ownerFlatApplication: FlatApplication;
    dryRun?: boolean;
  }): Promise<{
    workspaceMigration: WorkspaceMigration;
    hasSchemaMetadataChanged: boolean;
  }> {
    const now = new Date().toISOString();

    const recomputeStart = performance.now();
    const cacheResult = await this.workspaceCacheService.getOrRecompute(
      workspaceId,
      [
        ...Object.values(ALL_METADATA_NAME).map(getMetadataFlatEntityMapsKey),
        'featureFlagsMap',
      ],
    );
    const recomputeMs = performance.now() - recomputeStart;

    this.logger.perf(
      `[install-perf] syncMetadataFromManifest ALL_METADATA_NAME getOrRecompute flat-maps took ${recomputeMs.toFixed(1)}ms (logicFunctions=${manifest.logicFunctions.length})`,
      ApplicationManifestMigrationService.name,
    );

    const { featureFlagsMap: _featureFlagsMap, ...existingAllFlatEntityMaps } =
      cacheResult;

    let fromAllFlatEntityMaps = getApplicationSubAllFlatEntityMaps({
      applicationIds: [ownerFlatApplication.id],
      fromAllFlatEntityMaps: existingAllFlatEntityMaps,
    });

    const toAllUniversalFlatEntityMaps =
      this.computeManifestFlatEntityMapsService.compute({
        manifest,
        ownerFlatApplication,
        now,
        workspaceId,
      });

    const fieldUniversalIdentifierTakeovers =
      computeDefaultRelationFieldUniversalIdentifierTakeovers({
        fromFlatFieldMetadataMaps: fromAllFlatEntityMaps.flatFieldMetadataMaps,
        // Manifest-derived maps hold universal flat entities behind the
        // AllFlatEntityMaps type, same cast as the operation record builder.
        toUniversalFlatFieldMetadataMaps:
          toAllUniversalFlatEntityMaps.flatFieldMetadataMaps as unknown as MetadataUniversalFlatEntityMaps<'fieldMetadata'>,
      });

    if (fieldUniversalIdentifierTakeovers.length > 0) {
      fromAllFlatEntityMaps =
        await this.takeOverDefaultRelationFieldUniversalIdentifiers({
          workspaceId,
          ownerFlatApplication,
          takeovers: fieldUniversalIdentifierTakeovers,
        });
    }

    const allFlatEntityOperationRecordByMetadataName =
      buildAllFlatEntityOperationRecordByMetadataNameFromFromTo({
        fromAllFlatEntityMaps,
        toAllUniversalFlatEntityMaps,
        buildOptions: {
          isSystemBuild: false,
          inferDeletionFromMissingEntities: true,
          applicationUniversalIdentifier:
            ownerFlatApplication.universalIdentifier,
        },
      });

    const validateBuildRunStart = performance.now();
    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigrationFromRecord(
        {
          allFlatEntityOperationRecordByMetadataName,
          workspaceId,
          isSystemBuild: false,
          applicationUniversalIdentifier:
            ownerFlatApplication.universalIdentifier,
          dryRun,
        },
      );
    const validateBuildRunMs = performance.now() - validateBuildRunStart;

    this.logger.perf(
      `[install-perf] syncMetadataFromManifest validateBuildAndRunWorkspaceMigrationFromTo took ${validateBuildRunMs.toFixed(1)}ms (dryRun=${dryRun}, actions=${validateAndBuildResult.status === 'success' ? validateAndBuildResult.workspaceMigration.actions.length : 'n/a-failed'})`,
      ApplicationManifestMigrationService.name,
    );

    if (validateAndBuildResult.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(
        validateAndBuildResult,
        'Validation errors occurred while syncing application manifest metadata',
      );
    }

    this.logger.log(
      `Metadata migration ${dryRun ? 'plan computed (dry run)' : 'completed'} for application ${ownerFlatApplication.universalIdentifier}`,
      ApplicationManifestMigrationService.name,
    );

    if (!dryRun) {
      await this.syncDefaultRole({
        manifest,
        workspaceId,
        ownerFlatApplication,
      });
    }

    return {
      workspaceMigration: validateAndBuildResult.workspaceMigration,
      hasSchemaMetadataChanged: validateAndBuildResult.hasSchemaMetadataChanged,
    };
  }

  // Reassigns the universal identifier of installed auto-provisioned reverse
  // default relation fields to the derivation the manifest now uses, so an
  // object rename converges through in-place field renames instead of a
  // destroy/create pair that relation validation rejects. This runs before
  // the migration build (dry run included) because the whole migration engine
  // matches entities by universal identifier against the workspace cache: the
  // reassignment is identifier bookkeeping only, changes no schema or data,
  // and is idempotent.
  private async takeOverDefaultRelationFieldUniversalIdentifiers({
    workspaceId,
    ownerFlatApplication,
    takeovers,
  }: {
    workspaceId: string;
    ownerFlatApplication: FlatApplication;
    takeovers: FieldUniversalIdentifierTakeover[];
  }): Promise<AllFlatEntityMaps> {
    this.logger.log(
      `Taking over ${takeovers.length} default relation field universal identifier(s) for application ${ownerFlatApplication.universalIdentifier}`,
      ApplicationManifestMigrationService.name,
    );

    await this.fieldMetadataRepository.manager.transaction(
      async (entityManager) => {
        const transactionalFieldMetadataRepository =
          entityManager.getRepository(FieldMetadataEntity);

        for (const { fieldMetadataId, toUniversalIdentifier } of takeovers) {
          await transactionalFieldMetadataRepository.update(
            { id: fieldMetadataId, workspaceId },
            { universalIdentifier: toUniversalIdentifier },
          );
        }
      },
    );

    const fieldMetadataRelatedNames = [
      'fieldMetadata',
      ...getMetadataRelatedMetadataNames('fieldMetadata'),
      ...getMetadataSerializedRelationNames('fieldMetadata'),
      'index',
    ] as const;
    const allFlatEntityMapsKeys = [
      ...new Set(fieldMetadataRelatedNames.map(getMetadataFlatEntityMapsKey)),
    ];

    await this.workspaceMigrationRunnerService.invalidateCache({
      allFlatEntityMapsKeys,
      workspaceId,
    });

    const refreshedCacheResult =
      await this.workspaceCacheService.getOrRecompute(
        workspaceId,
        Object.values(ALL_METADATA_NAME).map(getMetadataFlatEntityMapsKey),
      );

    return getApplicationSubAllFlatEntityMaps({
      applicationIds: [ownerFlatApplication.id],
      fromAllFlatEntityMaps: refreshedCacheResult,
    });
  }

  private async syncDefaultRole({
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

      if (
        role.universalIdentifier ===
        manifest.application.defaultRoleUniversalIdentifier
      ) {
        defaultRoleId = flatRole.id;
      }
    }

    if (isDefined(defaultRoleId)) {
      await this.applicationService.update(ownerFlatApplication.id, {
        workspaceId,
        defaultRoleId,
      });
    }
  }
}
