import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { IsNull, Repository } from 'typeorm';
import { v4 } from 'uuid';

import {
  RunOnWorkspaceArgs,
  WorkspacesMigrationCommandRunner,
} from 'src/database/commands/command-runners/workspaces-migration.command-runner';
import {
  ALL_ENTITY_VIEW_NAME,
  computeFormattedViewName,
} from 'src/database/commands/upgrade-version-command/1-16/utils/compute-formatted-view-name.util';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { findManyFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';
import { getMetadataRelatedMetadataNames } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-related-metadata-names.util';
import { ViewEntity } from 'src/engine/metadata-modules/view/entities/view.entity';
import { ViewKey } from 'src/engine/metadata-modules/view/enums/view-key.enum';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { STANDARD_OBJECTS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-object.constant';

type CustomViewUpdate = {
  viewEntity: ViewEntity;
};

type StandardViewUpdate = {
  viewEntity: ViewEntity;
  universalIdentifier: string;
};

type AllExceptions = 'existing_universal_id_mismatch' | 'duplicate_index_view';

type ViewMetadataException = {
  viewEntity: ViewEntity;
  exception: AllExceptions;
  objectNameSingular?: string;
};

@Command({
  name: 'upgrade:1-16:identify-view-metadata',
  description: 'Identify standard view metadata',
})
export class IdentifyViewMetadataCommand extends WorkspacesMigrationCommandRunner {
  constructor(
    @InjectRepository(WorkspaceEntity)
    protected readonly workspaceRepository: Repository<WorkspaceEntity>,
    @InjectRepository(ViewEntity)
    private readonly viewRepository: Repository<ViewEntity>,
    protected readonly twentyORMGlobalManager: GlobalWorkspaceOrmManager,
    protected readonly dataSourceService: DataSourceService,
    protected readonly applicationService: ApplicationService,
    protected readonly workspaceCacheService: WorkspaceCacheService,
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
  ) {
    super(workspaceRepository, twentyORMGlobalManager, dataSourceService, [
      WorkspaceActivationStatus.ACTIVE,
      WorkspaceActivationStatus.SUSPENDED,
      WorkspaceActivationStatus.ONGOING_CREATION,
    ]);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    this.logger.log(
      `Running identify standard view metadata for workspace ${workspaceId}`,
    );

    const { twentyStandardFlatApplication, workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const { flatObjectMetadataMaps, flatViewMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatObjectMetadataMaps', 'flatViewMaps'],
        },
      );

    const customViewUpdates: CustomViewUpdate[] = [];
    const standardViewUpdates: StandardViewUpdate[] = [];
    const exceptions: ViewMetadataException[] = [];

    // Track used universalIdentifiers to detect duplicates
    const usedUniversalIdentifiers = new Set<string>();

    // Process views for each known standard object
    for (const [objectNameSingular, objectConfig] of Object.entries(
      STANDARD_OBJECTS,
    )) {
      const flatObjectMetadata = findFlatEntityByUniversalIdentifier({
        flatEntityMaps: flatObjectMetadataMaps,
        universalIdentifier: objectConfig.universalIdentifier,
      });

      if (!isDefined(flatObjectMetadata)) {
        this.logger.warn(
          `Standard object "${objectNameSingular}" not found in workspace, skipping`,
        );
        continue;
      }

      const viewsForObject = findManyFlatEntityByIdInFlatEntityMapsOrThrow({
        flatEntityIds: flatObjectMetadata.viewIds,
        flatEntityMaps: flatViewMaps,
      });
      const objectViews =
        'views' in objectConfig
          ? (objectConfig.views as Record<
              string,
              { universalIdentifier: string } | undefined
            >)
          : null;

      for (const viewEntity of viewsForObject) {
        // Custom views -> forward to custom
        if (viewEntity.isCustom) {
          customViewUpdates.push({ viewEntity });
          continue;
        }

        // INDEX views -> forward to standard (if object has views config)
        if (viewEntity.key === ViewKey.INDEX && isDefined(objectViews)) {
          const formattedViewName = computeFormattedViewName({
            viewName: viewEntity.name,
            flatObjectMetadata,
          });

          const viewConfig = objectViews[formattedViewName];
          const universalIdentifier = viewConfig?.universalIdentifier;

          if (isDefined(universalIdentifier)) {
            if (usedUniversalIdentifiers.has(universalIdentifier)) {
              exceptions.push({
                viewEntity,
                exception: 'duplicate_index_view',
                objectNameSingular,
              });
              continue;
            }

            if (
              isDefined(viewEntity.universalIdentifier) &&
              viewEntity.universalIdentifier !== universalIdentifier
            ) {
              exceptions.push({
                viewEntity,
                exception: 'existing_universal_id_mismatch',
                objectNameSingular,
              });
              continue;
            }

            usedUniversalIdentifiers.add(universalIdentifier);
            standardViewUpdates.push({
              viewEntity,
              universalIdentifier:
                viewEntity.universalIdentifier ?? universalIdentifier,
            });
            continue;
          }
        }

        // Views with "All" name pattern but not INDEX -> forward to custom
        if (viewEntity.name === ALL_ENTITY_VIEW_NAME) {
          customViewUpdates.push({ viewEntity });
          continue;
        }

        // Remaining views (like assignedToMe, byStatus, etc.) -> use computeFormattedViewName
        if (isDefined(objectViews)) {
          const formattedViewName = computeFormattedViewName({
            viewName: viewEntity.name,
            flatObjectMetadata,
          });

          const viewConfig = objectViews[formattedViewName];
          const universalIdentifier = viewConfig?.universalIdentifier;

          if (isDefined(universalIdentifier)) {
            if (usedUniversalIdentifiers.has(universalIdentifier)) {
              // Duplicate -> forward to custom
              customViewUpdates.push({ viewEntity });
              continue;
            }

            if (
              isDefined(viewEntity.universalIdentifier) &&
              viewEntity.universalIdentifier !== universalIdentifier
            ) {
              exceptions.push({
                viewEntity,
                exception: 'existing_universal_id_mismatch',
                objectNameSingular,
              });
              continue;
            }

            usedUniversalIdentifiers.add(universalIdentifier);
            standardViewUpdates.push({
              viewEntity,
              universalIdentifier:
                viewEntity.universalIdentifier ?? universalIdentifier,
            });
            continue;
          }
        }

        // No matching standard view config -> forward to custom
        customViewUpdates.push({ viewEntity });
      }
    }

    // Fetch all remaining views without applicationId (custom objects, etc.)
    const remainingViews = await this.viewRepository.find({
      select: {
        id: true,
        universalIdentifier: true,
        applicationId: true,
        name: true,
        objectMetadataId: true,
        isCustom: true,
      },
      where: {
        workspaceId,
        applicationId: IsNull(),
      },
    });

    const processedViewIds = new Set([
      ...customViewUpdates.map(({ viewEntity }) => viewEntity.id),
      ...standardViewUpdates.map(({ viewEntity }) => viewEntity.id),
      ...exceptions.map(({ viewEntity }) => viewEntity.id),
    ]);

    for (const viewEntity of remainingViews) {
      if (!processedViewIds.has(viewEntity.id)) {
        customViewUpdates.push({ viewEntity });
      }
    }

    const totalUpdates = customViewUpdates.length + standardViewUpdates.length;

    if (exceptions.length > 0) {
      this.logger.error(
        `Found ${exceptions.length} exception(s) while processing view metadata for workspace ${workspaceId}. No updates will be applied.`,
      );

      for (const { viewEntity, exception, objectNameSingular } of exceptions) {
        this.logger.error(
          `Exception for view "${viewEntity.name}" on object "${objectNameSingular ?? 'unknown'}" (id=${viewEntity.id}): ${exception}`,
        );
      }

      throw new Error(
        `Aborting migration for workspace ${workspaceId} due to ${exceptions.length} exception(s). See logs above for details.`,
      );
    }

    this.logger.log(
      `Successfully validated ${totalUpdates} view metadata update(s) for workspace ${workspaceId} (${customViewUpdates.length} custom, ${standardViewUpdates.length} standard)`,
    );

    if (!options.dryRun) {
      const customUpdates = customViewUpdates.map(({ viewEntity }) => ({
        id: viewEntity.id,
        universalIdentifier: viewEntity.universalIdentifier ?? v4(),
        applicationId: workspaceCustomFlatApplication.id,
      }));

      const standardUpdates = standardViewUpdates.map(
        ({ viewEntity, universalIdentifier }) => ({
          id: viewEntity.id,
          universalIdentifier,
          applicationId: twentyStandardFlatApplication.id,
        }),
      );

      await this.viewRepository.save([...customUpdates, ...standardUpdates]);

      const relatedMetadataNames = getMetadataRelatedMetadataNames('view');
      const relatedCacheKeysToInvalidate = relatedMetadataNames.map(
        getMetadataFlatEntityMapsKey,
      );

      this.logger.log(
        `Invalidating caches: ${relatedCacheKeysToInvalidate.join(' ')}`,
      );
      await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
        'flatViewMaps',
        ...relatedCacheKeysToInvalidate,
      ]);

      this.logger.log(
        `Applied ${totalUpdates} view metadata update(s) for workspace ${workspaceId}`,
      );
    } else {
      this.logger.log(
        `Dry run: would apply ${totalUpdates} view metadata update(s) for workspace ${workspaceId}`,
      );
    }
  }
}
