import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';
import { IsNull, Repository } from 'typeorm';
import { v4 } from 'uuid';

import { ActiveOrSuspendedWorkspacesMigrationCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspaces-migration.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { findManyFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';
import { getMetadataRelatedMetadataNames } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-related-metadata-names.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatViewFilter } from 'src/engine/metadata-modules/flat-view-filter/types/flat-view-filter.type';
import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';
import { ViewFilterEntity } from 'src/engine/metadata-modules/view-filter/entities/view-filter.entity';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { STANDARD_OBJECTS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-object.constant';

@Command({
  name: 'upgrade:1-16:identify-view-filter-metadata',
  description: 'Identify standard view filter metadata',
})
export class IdentifyViewFilterMetadataCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  constructor(
    @InjectRepository(WorkspaceEntity)
    protected readonly workspaceRepository: Repository<WorkspaceEntity>,
    @InjectRepository(ViewFilterEntity)
    private readonly viewFilterRepository: Repository<ViewFilterEntity>,
    protected readonly twentyORMGlobalManager: GlobalWorkspaceOrmManager,
    protected readonly dataSourceService: DataSourceService,
    protected readonly applicationService: ApplicationService,
    protected readonly workspaceCacheService: WorkspaceCacheService,
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
  ) {
    super(workspaceRepository, twentyORMGlobalManager, dataSourceService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    this.logger.log(
      `Running identify standard view filter metadata for workspace ${workspaceId}`,
    );

    const { twentyStandardFlatApplication, workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const { flatFieldMetadataMaps, flatViewMaps, flatViewFilterMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: [
            'flatFieldMetadataMaps',
            'flatViewMaps',
            'flatViewFilterMaps',
          ],
        },
      );

    await this.identifyStandardViewFilter({
      flatFieldMetadataMaps,
      flatViewMaps,
      flatViewFilterMaps,
      twentyStandardApplicationId: twentyStandardFlatApplication.id,
      dryRun: options.dryRun ?? false,
    });

    await this.identifyCustomViewFilters({
      workspaceId,
      workspaceCustomApplicationId: workspaceCustomFlatApplication.id,
      dryRun: options.dryRun ?? false,
    });

    const relatedMetadataNames = getMetadataRelatedMetadataNames('viewFilter');
    const relatedCacheKeysToInvalidate = relatedMetadataNames.map(
      getMetadataFlatEntityMapsKey,
    );

    this.logger.log(
      `Invalidating caches: ${relatedCacheKeysToInvalidate.join(' ')}`,
    );
    if (!options.dryRun) {
      await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
        'flatViewFilterMaps',
        ...relatedCacheKeysToInvalidate,
      ]);
    }
  }

  private async identifyStandardViewFilter({
    flatFieldMetadataMaps,
    flatViewMaps,
    flatViewFilterMaps,
    twentyStandardApplicationId,
    dryRun,
  }: {
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
    flatViewMaps: FlatEntityMaps<FlatView>;
    flatViewFilterMaps: FlatEntityMaps<FlatViewFilter>;
    twentyStandardApplicationId: string;
    dryRun: boolean;
  }): Promise<void> {
    const flatView = findFlatEntityByUniversalIdentifier({
      flatEntityMaps: flatViewMaps,
      universalIdentifier:
        STANDARD_OBJECTS.task.views.assignedToMe.universalIdentifier,
    });

    if (!isDefined(flatView)) {
      this.logger.warn(
        `Standard view "assignedToMe" not found for task object, skipping standard view filter identification`,
      );

      return;
    }

    const flatFieldMetadata = findFlatEntityByUniversalIdentifier({
      flatEntityMaps: flatFieldMetadataMaps,
      universalIdentifier:
        STANDARD_OBJECTS.task.fields.assignee.universalIdentifier,
    });

    if (!isDefined(flatFieldMetadata)) {
      this.logger.warn(
        `Field "assignee" not found for task object, skipping standard view filter identification`,
      );

      return;
    }

    const relatedFlatViewFilters =
      findManyFlatEntityByIdInFlatEntityMapsOrThrow({
        flatEntityIds: flatView.viewFilterIds,
        flatEntityMaps: flatViewFilterMaps,
      });

    const matchingFlatViewFilter = relatedFlatViewFilters.find(
      (viewFilter) => viewFilter.fieldMetadataId === flatFieldMetadata.id,
    );

    if (!isDefined(matchingFlatViewFilter)) {
      this.logger.warn(
        `Standard view filter "assigneeIsMe" not found for view "assignedToMe" of task object, skipping`,
      );

      return;
    }

    if (isDefined(matchingFlatViewFilter.applicationId)) {
      this.logger.warn(
        `Standard view filter "assigneeIsMe" already has applicationId set, skipping`,
      );

      return;
    }

    this.logger.log(
      `  - Standard view filter "assigneeIsMe" on view "assignedToMe" of object "task" (id=${matchingFlatViewFilter.id}) -> universalIdentifier=${STANDARD_OBJECTS.task.views.assignedToMe.viewFilters.assigneeIsMe.universalIdentifier}`,
    );

    if (!dryRun) {
      await this.viewFilterRepository.save({
        id: matchingFlatViewFilter.id,
        universalIdentifier:
          STANDARD_OBJECTS.task.views.assignedToMe.viewFilters.assigneeIsMe
            .universalIdentifier,
        applicationId: twentyStandardApplicationId,
      });
    }
  }

  private async identifyCustomViewFilters({
    workspaceId,
    workspaceCustomApplicationId,
    dryRun,
  }: {
    workspaceId: string;
    workspaceCustomApplicationId: string;
    dryRun: boolean;
  }): Promise<void> {
    const remainingCustomViewFilters = await this.viewFilterRepository.find({
      select: {
        id: true,
        universalIdentifier: true,
        applicationId: true,
      },
      where: {
        workspaceId,
        applicationId: IsNull(),
      },
      withDeleted: true,
    });

    const customUpdates = remainingCustomViewFilters.map(
      (viewFilterEntity) => ({
        id: viewFilterEntity.id,
        universalIdentifier: viewFilterEntity.universalIdentifier ?? v4(),
        applicationId: workspaceCustomApplicationId,
      }),
    );

    this.logger.log(
      `Found ${customUpdates.length} custom view filter(s) to update for workspace ${workspaceId}`,
    );

    if (!dryRun) {
      await this.viewFilterRepository.save(customUpdates);
    }
  }
}
