import { Injectable, Logger } from '@nestjs/common';

import { type Manifest } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { APPLICATION_MANIFEST_METADATA_NAMES } from 'src/engine/core-modules/application/constants/application-manifest-metadata-names.constant';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { computeApplicationManifestAllUniversalFlatEntityMaps } from 'src/engine/core-modules/application/utils/compute-application-manifest-all-universal-flat-entity-maps.util';
import { type MetadataFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity.type';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';
import { getSubFlatEntityMapsByApplicationIdOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/get-sub-flat-entity-maps-by-application-id-or-throw.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';
import { type FromToAllFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/types/workspace-migration-orchestrator.type';

@Injectable()
export class ApplicationManifestMigrationService {
  private readonly logger = new Logger(
    ApplicationManifestMigrationService.name,
  );

  constructor(
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
  ) {}

  async syncMetadataFromManifest({
    manifest,
    workspaceId,
    ownerFlatApplication,
  }: {
    manifest: Manifest;
    workspaceId: string;
    ownerFlatApplication: FlatApplication;
  }) {
    const now = new Date().toISOString();

    // Build the "to" state from the manifest
    const toAllFlatEntityMaps =
      computeApplicationManifestAllUniversalFlatEntityMaps({
        manifest,
        applicationUniversalIdentifier:
          ownerFlatApplication.universalIdentifier,
        now,
      });

    // Fetch the current "from" state from cache
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

    // Build the from/to maps for each metadata type
    const fromToAllFlatEntityMaps: FromToAllFlatEntityMaps = {};

    for (const metadataName of APPLICATION_MANIFEST_METADATA_NAMES) {
      const flatEntityMapsKey = getMetadataFlatEntityMapsKey(metadataName);
      const fromFlatEntityMaps = fromAllFlatEntityMaps[flatEntityMapsKey];
      const toFlatEntityMaps = toAllFlatEntityMaps[flatEntityMapsKey];

      const fromTo = {
        from: getSubFlatEntityMapsByApplicationIdOrThrow<
          MetadataFlatEntity<typeof metadataName>
        >({
          applicationId: ownerFlatApplication.id,
          flatEntityMaps: fromFlatEntityMaps,
        }),
        to: toFlatEntityMaps,
      };

      // @ts-expect-error Metadata flat entity maps cache key and metadataName colliding
      fromToAllFlatEntityMaps[flatEntityMapsKey] = fromTo;
    }

    // Run the migration
    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigrationFromTo(
        {
          buildOptions: {
            isSystemBuild: true,
            inferDeletionFromMissingEntities: true,
          },
          fromToAllFlatEntityMaps,
          workspaceId,
          additionalCacheDataMaps: { featureFlagsMap },
          applicationUniversalIdentifier:
            ownerFlatApplication.universalIdentifier,
        },
      );

    if (isDefined(validateAndBuildResult)) {
      throw new WorkspaceMigrationBuilderException(
        validateAndBuildResult,
        'Validation errors occurred while syncing application manifest metadata',
      );
    }

    this.logger.log(
      `Metadata migration completed for application ${ownerFlatApplication.universalIdentifier}`,
    );
  }
}
