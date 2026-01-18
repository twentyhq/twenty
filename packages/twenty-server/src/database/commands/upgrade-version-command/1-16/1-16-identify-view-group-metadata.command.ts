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
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type FlatViewGroup } from 'src/engine/metadata-modules/flat-view-group/types/flat-view-group.type';
import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';
import { ViewGroupEntity } from 'src/engine/metadata-modules/view-group/entities/view-group.entity';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { STANDARD_OBJECTS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-object.constant';

const VIEW_GROUP_TO_FIELD_VALUE_MAPPING: Record<
  string,
  Record<string, Record<string, string>>
> = {
  opportunity: {
    byStage: {
      new: 'NEW',
      screening: 'SCREENING',
      meeting: 'MEETING',
      proposal: 'PROPOSAL',
      customer: 'CUSTOMER',
    },
  },
  task: {
    assignedToMe: {
      todo: 'TODO',
      inProgress: 'IN_PROGRESS',
      done: 'DONE',
      empty: '',
    },
    byStatus: {
      todo: 'TODO',
      inProgress: 'IN_PROGRESS',
      done: 'DONE',
    },
  },
};

type StandardViewGroupUpdate = {
  flatViewGroup: FlatViewGroup;
  universalIdentifier: string;
  objectNameSingular: string;
  viewName: string;
  viewGroupName: string;
};

@Command({
  name: 'upgrade:1-16:identify-view-group-metadata',
  description: 'Identify standard view group metadata',
})
export class IdentifyViewGroupMetadataCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  constructor(
    @InjectRepository(WorkspaceEntity)
    protected readonly workspaceRepository: Repository<WorkspaceEntity>,
    @InjectRepository(ViewGroupEntity)
    private readonly viewGroupRepository: Repository<ViewGroupEntity>,
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
      `Running identify standard view group metadata for workspace ${workspaceId}`,
    );

    const { twentyStandardFlatApplication, workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const { flatObjectMetadataMaps, flatViewMaps, flatViewGroupMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: [
            'flatObjectMetadataMaps',
            'flatViewMaps',
            'flatViewGroupMaps',
          ],
        },
      );

    await this.identifyStandardViewGroups({
      flatObjectMetadataMaps,
      flatViewMaps,
      flatViewGroupMaps,
      twentyStandardApplicationId: twentyStandardFlatApplication.id,
      dryRun: options.dryRun ?? false,
    });

    await this.identifyCustomViewGroups({
      workspaceId,
      flatObjectMetadataMaps,
      flatViewMaps,
      workspaceCustomApplicationId: workspaceCustomFlatApplication.id,
      dryRun: options.dryRun ?? false,
    });

    const relatedMetadataNames = getMetadataRelatedMetadataNames('viewGroup');
    const relatedCacheKeysToInvalidate = relatedMetadataNames.map(
      getMetadataFlatEntityMapsKey,
    );

    this.logger.log(
      `Invalidating caches: ${relatedCacheKeysToInvalidate.join(' ')}`,
    );
    if (!options.dryRun) {
      await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
        'flatViewGroupMaps',
        ...relatedCacheKeysToInvalidate,
      ]);
    }
  }

  private async identifyStandardViewGroups({
    flatObjectMetadataMaps,
    flatViewMaps,
    flatViewGroupMaps,
    twentyStandardApplicationId,
    dryRun,
  }: {
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
    flatViewMaps: FlatEntityMaps<FlatView>;
    flatViewGroupMaps: FlatEntityMaps<FlatViewGroup>;
    twentyStandardApplicationId: string;
    dryRun: boolean;
  }): Promise<void> {
    const standardViewGroupUpdates: StandardViewGroupUpdate[] = [];

    for (const [objectNameSingular, objectConfig] of Object.entries(
      STANDARD_OBJECTS,
    )) {
      const objectViews =
        'views' in objectConfig
          ? (objectConfig.views as Record<
              string,
              | {
                  universalIdentifier: string;
                  viewGroups?: Record<
                    string,
                    { universalIdentifier: string } | undefined
                  >;
                }
              | undefined
            >)
          : null;

      if (!isDefined(objectViews)) {
        continue;
      }

      const flatObjectMetadata = findFlatEntityByUniversalIdentifier({
        flatEntityMaps: flatObjectMetadataMaps,
        universalIdentifier: objectConfig.universalIdentifier,
      });

      if (!isDefined(flatObjectMetadata)) {
        this.logger.error(
          `Standard object "${objectNameSingular}" not found in workspace, this needs investigation, skipping`,
        );
        continue;
      }

      const objectViewGroupMapping =
        VIEW_GROUP_TO_FIELD_VALUE_MAPPING[objectNameSingular];

      for (const [viewName, viewConfig] of Object.entries(objectViews)) {
        if (!isDefined(viewConfig) || !isDefined(viewConfig.viewGroups)) {
          continue;
        }

        const flatView = findFlatEntityByUniversalIdentifier({
          flatEntityMaps: flatViewMaps,
          universalIdentifier: viewConfig.universalIdentifier,
        });

        if (!isDefined(flatView)) {
          this.logger.warn(
            `Standard view "${viewName}" not found for object "${flatObjectMetadata.nameSingular}", skipping view groups`,
          );
          continue;
        }

        const relatedFlatViewGroups =
          findManyFlatEntityByIdInFlatEntityMapsOrThrow({
            flatEntityIds: flatView.viewGroupIds,
            flatEntityMaps: flatViewGroupMaps,
          });

        const viewGroupMapping = objectViewGroupMapping?.[viewName];

        for (const [viewGroupName, viewGroupConfig] of Object.entries(
          viewConfig.viewGroups,
        )) {
          if (!isDefined(viewGroupConfig)) {
            continue;
          }

          const fieldValue = viewGroupMapping?.[viewGroupName];

          if (!isDefined(fieldValue) && fieldValue !== '') {
            this.logger.warn(
              `Field value mapping for view group "${viewGroupName}" not found for view "${viewName}" of object "${flatObjectMetadata.nameSingular}", skipping view group`,
            );
            continue;
          }

          const matchingFlatViewGroup = relatedFlatViewGroups.find(
            (viewGroup) => viewGroup.fieldValue === fieldValue,
          );

          if (!isDefined(matchingFlatViewGroup)) {
            this.logger.warn(
              `Standard view group "${viewGroupName}" with fieldValue="${fieldValue}" not found for view "${viewName}" of object "${flatObjectMetadata.nameSingular}", skipping`,
            );
            continue;
          }

          if (isDefined(matchingFlatViewGroup.applicationId)) {
            continue;
          }

          standardViewGroupUpdates.push({
            flatViewGroup: matchingFlatViewGroup,
            universalIdentifier: viewGroupConfig.universalIdentifier,
            objectNameSingular: flatObjectMetadata.nameSingular,
            viewName: flatView.name,
            viewGroupName,
          });
        }
      }
    }

    const standardUpdates = standardViewGroupUpdates.map(
      ({ flatViewGroup, universalIdentifier }) => ({
        id: flatViewGroup.id,
        universalIdentifier,
        applicationId: twentyStandardApplicationId,
      }),
    );

    this.logger.log(
      `Found ${standardUpdates.length} standard view group(s) to update`,
    );

    for (const {
      flatViewGroup,
      universalIdentifier,
      objectNameSingular,
      viewName,
      viewGroupName,
    } of standardViewGroupUpdates) {
      this.logger.log(
        `  - Standard view group "${viewGroupName}" on view "${viewName}" of object "${objectNameSingular}" (id=${flatViewGroup.id}) -> universalIdentifier=${universalIdentifier}`,
      );
    }

    if (!dryRun) {
      await this.viewGroupRepository.save(standardUpdates);
    }
  }

  private async identifyCustomViewGroups({
    workspaceId,
    flatObjectMetadataMaps,
    flatViewMaps,
    workspaceCustomApplicationId,
    dryRun,
  }: {
    workspaceId: string;
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
    flatViewMaps: FlatEntityMaps<FlatView>;
    workspaceCustomApplicationId: string;
    dryRun: boolean;
  }): Promise<void> {
    const remainingCustomViewGroups = await this.viewGroupRepository.find({
      select: {
        id: true,
        universalIdentifier: true,
        applicationId: true,
        viewId: true,
        fieldValue: true,
      },
      where: {
        workspaceId,
        applicationId: IsNull(),
      },
      withDeleted: true,
    });

    const customUpdates = remainingCustomViewGroups.map((viewGroupEntity) => ({
      id: viewGroupEntity.id,
      universalIdentifier: viewGroupEntity.universalIdentifier ?? v4(),
      applicationId: workspaceCustomApplicationId,
    }));

    this.logger.log(
      `Found ${customUpdates.length} custom view group(s) to update for workspace ${workspaceId}`,
    );

    for (const viewGroupEntity of remainingCustomViewGroups) {
      const flatView = flatViewMaps.byId[viewGroupEntity.viewId];
      const flatObjectMetadata = isDefined(flatView)
        ? flatObjectMetadataMaps.byId[flatView.objectMetadataId]
        : undefined;

      this.logger.log(
        `  - Custom view group with fieldValue="${viewGroupEntity.fieldValue}" on view "${flatView?.name ?? 'unknown'}" of object "${flatObjectMetadata?.nameSingular ?? 'unknown'}" (id=${viewGroupEntity.id})`,
      );
    }

    if (!dryRun) {
      await this.viewGroupRepository.save(customUpdates);
    }
  }
}
