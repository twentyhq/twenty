import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { DataSource, QueryRunner, Repository } from 'typeorm';

import {
  ActiveOrSuspendedWorkspacesMigrationCommandRunner,
  RunOnWorkspaceArgs,
} from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { ViewFilterGroupLogicalOperator } from 'src/engine/metadata-modules/view/enums/view-filter-group-logical-operator';
import { ViewOpenRecordIn } from 'src/engine/metadata-modules/view/enums/view-open-record-in';
import { ViewSortDirection } from 'src/engine/metadata-modules/view/enums/view-sort-direction';
import { ViewField } from 'src/engine/metadata-modules/view/view-field.entity';
import { ViewFilterGroup } from 'src/engine/metadata-modules/view/view-filter-group.entity';
import { ViewFilter } from 'src/engine/metadata-modules/view/view-filter.entity';
import { ViewGroup } from 'src/engine/metadata-modules/view/view-group.entity';
import { ViewSort } from 'src/engine/metadata-modules/view/view-sort.entity';
import { View } from 'src/engine/metadata-modules/view/view.entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { ViewFieldWorkspaceEntity } from 'src/modules/view/standard-objects/view-field.workspace-entity';
import { ViewFilterGroupWorkspaceEntity } from 'src/modules/view/standard-objects/view-filter-group.workspace-entity';
import { ViewFilterWorkspaceEntity } from 'src/modules/view/standard-objects/view-filter.workspace-entity';
import { ViewGroupWorkspaceEntity } from 'src/modules/view/standard-objects/view-group.workspace-entity';
import { ViewSortWorkspaceEntity } from 'src/modules/view/standard-objects/view-sort.workspace-entity';
import { ViewWorkspaceEntity } from 'src/modules/view/standard-objects/view.workspace-entity';
import { transformViewFilterWorkspaceValueToCoreValue } from 'src/modules/view/utils/transform-view-filter-workspace-value-to-core-value';

@Command({
  name: 'migrate:views-to-core',
  description:
    'Migrate views from workspace schemas to core schema and enable IS_CORE_VIEW_SYNCING_ENABLED feature flag',
})
export class MigrateViewsToCoreCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  constructor(
    @InjectRepository(Workspace, 'core')
    protected readonly workspaceRepository: Repository<Workspace>,
    private readonly featureFlagService: FeatureFlagService,
    protected readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    @InjectDataSource('core')
    private readonly coreDataSource: DataSource,
  ) {
    super(workspaceRepository, twentyORMGlobalManager);
  }

  override async runOnWorkspace({
    index,
    total,
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    this.logger.log(
      `Migrating views to core schema for workspace ${workspaceId} ${index + 1}/${total}`,
    );

    const queryRunner = this.coreDataSource.createQueryRunner();

    await queryRunner.connect();

    try {
      await queryRunner.startTransaction();

      try {
        await this.migrateViews(
          workspaceId,
          options.dryRun ?? false,
          queryRunner,
        );

        if (options.dryRun) {
          this.logger.log(
            `DRY RUN: Would enable IS_CORE_VIEW_SYNCING_ENABLED feature flag for workspace ${workspaceId}`,
          );
        } else {
          await queryRunner.commitTransaction();
          await this.enableCoreViewSyncingFeatureFlag(workspaceId);
          this.logger.log(
            `Successfully migrated views to core schema for workspace ${workspaceId}`,
          );
        }
      } catch (error) {
        if (queryRunner.isTransactionActive) {
          await queryRunner.rollbackTransaction();
          this.logger.error(
            `Transaction rolled back for workspace ${workspaceId} due to error: ${error.message}`,
          );
        }

        throw error;
      }
    } catch (error) {
      this.logger.error(
        `Failed to migrate views to core schema for workspace ${workspaceId}: ${error.message}`,
      );

      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async migrateViews(
    workspaceId: string,
    dryRun: boolean,
    queryRunner: QueryRunner,
  ): Promise<void> {
    const workspaceViewRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<ViewWorkspaceEntity>(
        workspaceId,
        'view',
        { shouldBypassPermissionChecks: true },
      );

    const workspaceViews = await workspaceViewRepository.find({
      relations: [
        'viewFields',
        'viewFilters',
        'viewSorts',
        'viewGroups',
        'viewFilterGroups',
      ],
      withDeleted: true,
    });

    if (workspaceViews.length === 0) {
      this.logger.log(`No views to migrate for workspace ${workspaceId}`);

      return;
    }

    this.logger.log(
      `${dryRun ? 'DRY RUN: ' : ''}Found ${workspaceViews.length} views to migrate for workspace ${workspaceId}`,
    );

    if (dryRun) {
      for (const view of workspaceViews) {
        const deletedStatus = view.deletedAt ? ' (DELETED)' : '';

        this.logger.log(
          `DRY RUN: Would migrate view ${view.id} (${view.name})${deletedStatus} with ${view.viewFields.length} fields, ${view.viewFilters.length} filters, ${view.viewSorts.length} sorts, ${view.viewGroups.length} groups, ${view.viewFilterGroups.length} filter groups`,
        );
      }

      return;
    }

    await this.deleteExistingCoreViewObjects(workspaceId, queryRunner, dryRun);

    for (const workspaceView of workspaceViews) {
      await this.migrateViewEntity(workspaceView, workspaceId, queryRunner);

      if (workspaceView.viewFields?.length > 0) {
        await this.migrateViewFields(
          workspaceView.viewFields,
          workspaceId,
          queryRunner,
        );
      }

      if (workspaceView.viewFilters?.length > 0) {
        await this.migrateViewFilters(
          workspaceView.viewFilters,
          workspaceId,
          queryRunner,
        );
      }

      if (workspaceView.viewSorts?.length > 0) {
        await this.migrateViewSorts(
          workspaceView.viewSorts,
          workspaceId,
          queryRunner,
        );
      }

      if (workspaceView.viewGroups?.length > 0) {
        await this.migrateViewGroups(
          workspaceView.viewGroups,
          workspaceId,
          queryRunner,
        );
      }

      if (workspaceView.viewFilterGroups?.length > 0) {
        await this.migrateViewFilterGroups(
          workspaceView.viewFilterGroups,
          workspaceId,
          queryRunner,
        );
      }

      const deletedStatus = workspaceView.deletedAt ? ' (DELETED)' : '';

      this.logger.log(
        `Migrated view ${workspaceView.id} (${workspaceView.name})${deletedStatus} to core schema`,
      );
    }
  }

  private async deleteExistingCoreViewObjects(
    workspaceId: string,
    queryRunner: QueryRunner,
    dryRun: boolean,
  ): Promise<void> {
    const viewRepository = queryRunner.manager.getRepository(View);
    const existingViews = await viewRepository.find({
      where: { workspaceId },
      select: ['id'],
      withDeleted: true,
    });

    if (existingViews.length === 0) {
      this.logger.log(
        `No existing core view objects found for workspace ${workspaceId}`,
      );

      return;
    }

    this.logger.log(
      `${dryRun ? 'DRY RUN: ' : ''}Deleting ${existingViews.length} existing core view objects for workspace ${workspaceId}`,
    );

    if (dryRun) {
      this.logger.log(
        `DRY RUN: Would delete all existing core view objects for workspace ${workspaceId}`,
      );

      return;
    }

    await viewRepository.delete({ workspaceId });

    this.logger.log(
      `Deleted all existing core view objects for workspace ${workspaceId}`,
    );
  }

  private async migrateViewEntity(
    workspaceView: ViewWorkspaceEntity,
    workspaceId: string,
    queryRunner: QueryRunner,
  ): Promise<void> {
    const coreView: Partial<View> = {
      id: workspaceView.id,
      name: workspaceView.name,
      objectMetadataId: workspaceView.objectMetadataId,
      type: workspaceView.type,
      key: workspaceView.key,
      icon: workspaceView.icon,
      position: workspaceView.position,
      isCompact: workspaceView.isCompact,
      openRecordIn:
        workspaceView.openRecordIn === 'SIDE_PANEL'
          ? ViewOpenRecordIn.SIDE_PANEL
          : ViewOpenRecordIn.RECORD_PAGE,
      kanbanAggregateOperation: workspaceView.kanbanAggregateOperation,
      kanbanAggregateOperationFieldMetadataId:
        workspaceView.kanbanAggregateOperationFieldMetadataId,
      workspaceId,
      createdAt: new Date(workspaceView.createdAt),
      updatedAt: new Date(workspaceView.updatedAt),
      deletedAt: workspaceView.deletedAt
        ? new Date(workspaceView.deletedAt)
        : null,
      anyFieldFilterValue: workspaceView.anyFieldFilterValue,
    };

    const repository = queryRunner.manager.getRepository(View);

    await repository.insert(coreView);
  }

  private async migrateViewFields(
    workspaceViewFields: ViewFieldWorkspaceEntity[],
    workspaceId: string,
    queryRunner: QueryRunner,
  ): Promise<void> {
    for (const field of workspaceViewFields) {
      const coreViewField: Partial<ViewField> = {
        id: field.id,
        fieldMetadataId: field.fieldMetadataId,
        viewId: field.viewId,
        position: field.position,
        isVisible: field.isVisible,
        size: field.size,
        workspaceId,
        createdAt: new Date(field.createdAt),
        updatedAt: new Date(field.updatedAt),
        deletedAt: field.deletedAt ? new Date(field.deletedAt) : null,
      };

      const repository = queryRunner.manager.getRepository(ViewField);

      await repository.insert(coreViewField);
    }
  }

  private async migrateViewFilters(
    workspaceViewFilters: ViewFilterWorkspaceEntity[],
    workspaceId: string,
    queryRunner: QueryRunner,
  ): Promise<void> {
    for (const filter of workspaceViewFilters) {
      if (!filter.viewId) {
        this.logger.warn(
          `Skipping view filter ${filter.id} with null viewId for workspace ${workspaceId}`,
        );
        continue;
      }

      const coreViewFilter: Partial<ViewFilter> = {
        id: filter.id,
        fieldMetadataId: filter.fieldMetadataId,
        viewId: filter.viewId,
        operand: filter.operand,
        value: transformViewFilterWorkspaceValueToCoreValue(filter.value),
        viewFilterGroupId: filter.viewFilterGroupId,
        workspaceId,
        createdAt: new Date(filter.createdAt),
        updatedAt: new Date(filter.updatedAt),
        deletedAt: filter.deletedAt ? new Date(filter.deletedAt) : null,
      };

      const repository = queryRunner.manager.getRepository(ViewFilter);

      await repository.insert(coreViewFilter);
    }
  }

  private async migrateViewSorts(
    workspaceViewSorts: ViewSortWorkspaceEntity[],
    workspaceId: string,
    queryRunner: QueryRunner,
  ): Promise<void> {
    for (const sort of workspaceViewSorts) {
      if (!sort.viewId) {
        this.logger.warn(
          `Skipping view sort ${sort.id} with null viewId for workspace ${workspaceId}`,
        );
        continue;
      }

      const direction = sort.direction.toUpperCase() as ViewSortDirection;

      const coreViewSort: Partial<ViewSort> = {
        id: sort.id,
        fieldMetadataId: sort.fieldMetadataId,
        viewId: sort.viewId,
        direction: direction,
        workspaceId,
        createdAt: new Date(sort.createdAt),
        updatedAt: new Date(sort.updatedAt),
        deletedAt: sort.deletedAt ? new Date(sort.deletedAt) : null,
      };

      const repository = queryRunner.manager.getRepository(ViewSort);

      await repository.insert(coreViewSort);
    }
  }

  private async migrateViewGroups(
    workspaceViewGroups: ViewGroupWorkspaceEntity[],
    workspaceId: string,
    queryRunner: QueryRunner,
  ): Promise<void> {
    for (const group of workspaceViewGroups) {
      if (!group.viewId) {
        this.logger.warn(
          `Skipping view group ${group.id} with null viewId for workspace ${workspaceId}`,
        );
        continue;
      }

      const coreViewGroup: Partial<ViewGroup> = {
        id: group.id,
        fieldMetadataId: group.fieldMetadataId,
        viewId: group.viewId,
        fieldValue: group.fieldValue,
        isVisible: group.isVisible,
        position: group.position,
        workspaceId,
        createdAt: new Date(group.createdAt),
        updatedAt: new Date(group.updatedAt),
        deletedAt: group.deletedAt ? new Date(group.deletedAt) : null,
      };

      const repository = queryRunner.manager.getRepository(ViewGroup);

      await repository.insert(coreViewGroup);
    }
  }

  private async migrateViewFilterGroups(
    workspaceViewFilterGroups: ViewFilterGroupWorkspaceEntity[],
    workspaceId: string,
    queryRunner: QueryRunner,
  ): Promise<void> {
    for (const filterGroup of workspaceViewFilterGroups) {
      const coreViewFilterGroup: Partial<ViewFilterGroup> = {
        id: filterGroup.id,
        viewId: filterGroup.viewId,
        logicalOperator:
          filterGroup.logicalOperator as ViewFilterGroupLogicalOperator,
        parentViewFilterGroupId: filterGroup.parentViewFilterGroupId,
        positionInViewFilterGroup: filterGroup.positionInViewFilterGroup,
        workspaceId,
        createdAt: new Date(filterGroup.createdAt),
        updatedAt: new Date(filterGroup.updatedAt),
        deletedAt: filterGroup.deletedAt
          ? new Date(filterGroup.deletedAt)
          : null,
      };

      const repository = queryRunner.manager.getRepository(ViewFilterGroup);

      await repository.insert(coreViewFilterGroup);
    }
  }

  private async enableCoreViewSyncingFeatureFlag(
    workspaceId: string,
  ): Promise<void> {
    await this.featureFlagService.enableFeatureFlags(
      [FeatureFlagKey.IS_CORE_VIEW_SYNCING_ENABLED],
      workspaceId,
    );

    this.logger.log(
      `Enabled IS_CORE_VIEW_SYNCING_ENABLED feature flag for workspace ${workspaceId}`,
    );
  }
}
