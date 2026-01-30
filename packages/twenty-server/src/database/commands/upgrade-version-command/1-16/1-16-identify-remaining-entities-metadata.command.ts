import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { type AllMetadataName } from 'twenty-shared/metadata';
import { DataSource, IsNull, Repository } from 'typeorm';
import { v4 } from 'uuid';

import { ActiveOrSuspendedWorkspacesMigrationCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspaces-migration.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { ALL_METADATA_ENTITY_BY_METADATA_NAME } from 'src/engine/metadata-modules/flat-entity/constant/all-metadata-entity-by-metadata-name.constant';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';
import { getMetadataRelatedMetadataNames } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-related-metadata-names.util';
import { ViewSortEntity } from 'src/engine/metadata-modules/view-sort/entities/view-sort.entity';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { SyncableEntity } from 'src/engine/workspace-manager/types/syncable-entity.interface';

const REMAINING_ENTITIES_METADATA_NAMES = [
  'roleTarget',
  'rowLevelPermissionPredicate',
  'rowLevelPermissionPredicateGroup',
  'viewFilterGroup',
  'logicFunction',
  'skill',
  'pageLayoutWidget',
  'pageLayout',
  'pageLayoutTab',
] as const satisfies AllMetadataName[];

@Command({
  name: 'upgrade:1-16:identify-remaining-entities-metadata',
  description:
    'Identify remaining entities metadata (roleTarget, rowLevelPermissionPredicate, rowLevelPermissionPredicateGroup, viewFilterGroup, viewSort, logicFunction, skill, pageLayoutWidget, pageLayout, pageLayoutTab)',
})
export class IdentifyRemainingEntitiesMetadataCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  constructor(
    @InjectRepository(WorkspaceEntity)
    protected readonly workspaceRepository: Repository<WorkspaceEntity>,
    protected readonly twentyORMGlobalManager: GlobalWorkspaceOrmManager,
    protected readonly dataSourceService: DataSourceService,
    protected readonly applicationService: ApplicationService,
    protected readonly workspaceCacheService: WorkspaceCacheService,
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
  ) {
    super(workspaceRepository, twentyORMGlobalManager, dataSourceService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    this.logger.log(
      `Running identify remaining entities metadata for workspace ${workspaceId}`,
    );

    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    for (const metadataName of REMAINING_ENTITIES_METADATA_NAMES) {
      await this.identifyEntitiesForMetadataName({
        metadataName,
        workspaceId,
        workspaceCustomApplicationId: workspaceCustomFlatApplication.id,
        dryRun: options.dryRun ?? false,
      });
    }

    await this.identifyViewSortEntities({
      workspaceId,
      workspaceCustomApplicationId: workspaceCustomFlatApplication.id,
      dryRun: options.dryRun ?? false,
    });
  }

  private async identifyEntitiesForMetadataName({
    metadataName,
    workspaceId,
    workspaceCustomApplicationId,
    dryRun,
  }: {
    metadataName: AllMetadataName;
    workspaceId: string;
    workspaceCustomApplicationId: string;
    dryRun: boolean;
  }): Promise<void> {
    const entityClass = ALL_METADATA_ENTITY_BY_METADATA_NAME[metadataName];
    const repository = this.coreDataSource.getRepository(entityClass);

    const entitiesWithoutApplicationId = await repository.find({
      select: ['id', 'universalIdentifier', 'applicationId'],
      where: {
        workspaceId,
        applicationId: IsNull(),
      },
      withDeleted: true,
    });

    if (entitiesWithoutApplicationId.length === 0) {
      this.logger.log(
        `No ${metadataName} entities found without applicationId for workspace ${workspaceId}`,
      );

      return;
    }

    const updates = entitiesWithoutApplicationId.map(
      (entity: SyncableEntity & { id: string }) => ({
        id: entity.id,
        universalIdentifier: entity.universalIdentifier ?? v4(),
        applicationId: workspaceCustomApplicationId,
      }),
    );

    this.logger.log(
      `Found ${updates.length} ${metadataName} entities to update for workspace ${workspaceId}`,
    );

    if (!dryRun) {
      await repository.save(updates);
    }

    const relatedMetadataNames = getMetadataRelatedMetadataNames(metadataName);
    const relatedCacheKeysToInvalidate = relatedMetadataNames.map(
      getMetadataFlatEntityMapsKey,
    );

    const flatEntityMapsKey = getMetadataFlatEntityMapsKey(metadataName);

    this.logger.log(
      `Invalidating caches: ${flatEntityMapsKey} ${relatedCacheKeysToInvalidate.join(' ')}`,
    );

    if (!dryRun) {
      await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
        flatEntityMapsKey,
        ...relatedCacheKeysToInvalidate,
      ]);
    }
  }

  private async identifyViewSortEntities({
    workspaceId,
    workspaceCustomApplicationId,
    dryRun,
  }: {
    workspaceId: string;
    workspaceCustomApplicationId: string;
    dryRun: boolean;
  }): Promise<void> {
    const viewSortRepository =
      this.coreDataSource.getRepository(ViewSortEntity);

    const viewSortsWithoutApplicationId = await viewSortRepository.find({
      select: ['id', 'universalIdentifier', 'applicationId'],
      where: {
        workspaceId,
        applicationId: IsNull(),
      },
      withDeleted: true,
    });

    if (viewSortsWithoutApplicationId.length === 0) {
      this.logger.log(
        `No viewSort entities found without applicationId for workspace ${workspaceId}`,
      );

      return;
    }

    const updates = viewSortsWithoutApplicationId.map((viewSort) => ({
      id: viewSort.id,
      universalIdentifier: viewSort.universalIdentifier ?? v4(),
      applicationId: workspaceCustomApplicationId,
    }));

    this.logger.log(
      `Found ${updates.length} viewSort entities to update for workspace ${workspaceId}`,
    );

    if (!dryRun) {
      await viewSortRepository.save(updates);
    }
  }
}
