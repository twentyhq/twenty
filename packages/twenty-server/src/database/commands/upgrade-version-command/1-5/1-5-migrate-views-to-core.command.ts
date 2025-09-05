import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { type ViewFilterOperand as SharedViewFilterOperand } from 'twenty-shared/types';
import { DataSource, In, Repository, type QueryRunner } from 'typeorm';

import {
  ActiveOrSuspendedWorkspacesMigrationCommandRunner,
  type RunOnWorkspaceArgs,
} from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { ViewFieldEntity } from 'src/engine/core-modules/view/entities/view-field.entity';
import { ViewFilterGroupEntity } from 'src/engine/core-modules/view/entities/view-filter-group.entity';
import { ViewFilterEntity } from 'src/engine/core-modules/view/entities/view-filter.entity';
import { ViewGroupEntity } from 'src/engine/core-modules/view/entities/view-group.entity';
import { ViewSortEntity } from 'src/engine/core-modules/view/entities/view-sort.entity';
import { ViewEntity } from 'src/engine/core-modules/view/entities/view.entity';
import { type ViewFilterGroupLogicalOperator } from 'src/engine/core-modules/view/enums/view-filter-group-logical-operator';
import { ViewKey } from 'src/engine/core-modules/view/enums/view-key.enum';
import { ViewOpenRecordIn } from 'src/engine/core-modules/view/enums/view-open-record-in';
import { type ViewSortDirection } from 'src/engine/core-modules/view/enums/view-sort-direction';
import { ViewType } from 'src/engine/core-modules/view/enums/view-type.enum';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { ViewFieldWorkspaceEntity } from 'src/modules/view/standard-objects/view-field.workspace-entity';
import { type ViewFilterGroupWorkspaceEntity } from 'src/modules/view/standard-objects/view-filter-group.workspace-entity';
import { type ViewFilterWorkspaceEntity } from 'src/modules/view/standard-objects/view-filter.workspace-entity';
import { type ViewGroupWorkspaceEntity } from 'src/modules/view/standard-objects/view-group.workspace-entity';
import { type ViewSortWorkspaceEntity } from 'src/modules/view/standard-objects/view-sort.workspace-entity';
import { type ViewWorkspaceEntity } from 'src/modules/view/standard-objects/view.workspace-entity';
import { convertViewFilterOperandToCoreOperand } from 'src/modules/view/utils/convert-view-filter-operand-to-core-operand.util';
import { convertViewFilterWorkspaceValueToCoreValue } from 'src/modules/view/utils/convert-view-filter-workspace-value-to-core-value';

@Command({
  name: 'upgrade:1-5:migrate-views-to-core',
  description: 'Migrate views from workspace schemas to core schema',
})
export class MigrateViewsToCoreCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  constructor(
    @InjectRepository(Workspace)
    protected readonly workspaceRepository: Repository<Workspace>,
    protected readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    @InjectDataSource()
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
            `DRY RUN: Would migrate views to core schema for workspace ${workspaceId}`,
          );
        } else {
          await queryRunner.commitTransaction();
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

    const {
      corruptedViewIds,
      corruptedViewFieldIds,
      corruptedViewFilterIds,
      corruptedViewSortIds,
      corruptedViewGroupIds,
    } = await this.fetchAndDeleteCorruptedViewResources(
      workspaceId,
      workspaceViews,
      queryRunner,
      dryRun,
    );

    const workspaceViewWithoutOrphansResources = workspaceViews
      .filter((view) => !corruptedViewIds.includes(view.id))
      .map((view) => ({
        ...view,
        viewFields: view.viewFields.filter(
          (viewField) => !corruptedViewFieldIds.includes(viewField.id),
        ),
        viewFilters: view.viewFilters.filter(
          (viewFilter) => !corruptedViewFilterIds.includes(viewFilter.id),
        ),
        viewSorts: view.viewSorts.filter(
          (viewSort) => !corruptedViewSortIds.includes(viewSort.id),
        ),
        viewGroups: view.viewGroups.filter(
          (viewGroup) => !corruptedViewGroupIds.includes(viewGroup.id),
        ),
      }));

    if (workspaceViewWithoutOrphansResources.length === 0) {
      this.logger.log(`No views to migrate for workspace ${workspaceId}`);

      return;
    }

    this.logger.log(
      `${dryRun ? 'DRY RUN: ' : ''}Found ${workspaceViews.length} views to migrate for workspace ${workspaceId}`,
    );

    if (dryRun) {
      for (const view of workspaceViewWithoutOrphansResources) {
        const deletedStatus = view.deletedAt ? ' (DELETED)' : '';

        this.logger.log(
          `DRY RUN: Would migrate view ${view.id} (${view.name})${deletedStatus} with ${view.viewFields.length} fields, ${view.viewFilters.length} filters, ${view.viewSorts.length} sorts, ${view.viewGroups.length} groups, ${view.viewFilterGroups.length} filter groups`,
        );
      }

      return;
    }

    await this.deleteExistingCoreViewObjects(workspaceId, queryRunner, dryRun);

    for (const workspaceView of workspaceViewWithoutOrphansResources) {
      await this.migrateViewEntity(workspaceView, workspaceId, queryRunner);

      if (workspaceView.viewFields?.length > 0) {
        await this.migrateViewFields(
          workspaceView.viewFields,
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

      const deletedStatus = workspaceView.deletedAt ? ' (DELETED)' : '';

      this.logger.log(
        `Migrated view ${workspaceView.id} (${workspaceView.name})${deletedStatus} to core schema`,
      );
    }
  }

  private async fetchAndDeleteCorruptedViewResources(
    workspaceId: string,
    views: ViewWorkspaceEntity[],
    queryRunner: QueryRunner,
    dryRun: boolean,
  ): Promise<{
    corruptedViewIds: string[];
    corruptedViewFieldIds: string[];
    corruptedViewFilterIds: string[];
    corruptedViewSortIds: string[];
    corruptedViewGroupIds: string[];
  }> {
    const fieldMetadataIdsUsedInViewFields = views
      .flatMap((view) => view.viewFields)
      .map((viewField) => viewField.fieldMetadataId);

    const fieldMetadataIdsUsedInViewFilters = views
      .flatMap((view) => view.viewFilters)
      .map((viewFilter) => viewFilter.fieldMetadataId);

    const fieldMetadataIdsUsedInViewSorts = views
      .flatMap((view) => view.viewSorts)
      .map((viewSort) => viewSort.fieldMetadataId);

    const fieldMetadataIdsUsedInViewGroups = views
      .flatMap((view) => view.viewGroups)
      .map((viewGroup) => viewGroup.fieldMetadataId);

    const fieldMetadataIds = [
      ...fieldMetadataIdsUsedInViewFields,
      ...fieldMetadataIdsUsedInViewFilters,
      ...fieldMetadataIdsUsedInViewSorts,
      ...fieldMetadataIdsUsedInViewGroups,
    ];

    const fieldMetadataRepository =
      queryRunner.manager.getRepository(FieldMetadataEntity);
    const fieldMetadataItems = await fieldMetadataRepository.find({
      where: {
        id: In(fieldMetadataIds),
      },
    });

    const existingFieldMetadataIds = fieldMetadataItems.map(
      (fieldMetadata) => fieldMetadata.id,
    );

    const corruptedViewFieldIds = views
      .flatMap((view) => view.viewFields)
      .filter(
        (viewField) =>
          !existingFieldMetadataIds.includes(viewField.fieldMetadataId) ||
          viewField.position === null,
      )
      .map((viewField) => viewField.id);

    const corruptedViewFilterIds = views
      .flatMap((view) => view.viewFilters)
      .filter(
        (viewFilter) =>
          !existingFieldMetadataIds.includes(viewFilter.fieldMetadataId),
      )
      .map((viewFilter) => viewFilter.id);

    const corruptedViewSortIds = views
      .flatMap((view) => view.viewSorts)
      .filter(
        (viewSort) =>
          !existingFieldMetadataIds.includes(viewSort.fieldMetadataId),
      )
      .map((viewSort) => viewSort.id);

    const corruptedViewGroupIds = views
      .flatMap((view) => view.viewGroups)
      .filter(
        (viewGroup) =>
          !existingFieldMetadataIds.includes(viewGroup.fieldMetadataId),
      )
      .map((viewGroup) => viewGroup.id);

    const workspaceViewFieldRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<ViewFieldWorkspaceEntity>(
        workspaceId,
        'viewField',
        { shouldBypassPermissionChecks: true },
      );

    if (!dryRun) {
      await workspaceViewFieldRepository.delete({
        id: In(corruptedViewFieldIds),
      });
    }

    this.logger.log(
      `Deleted ${corruptedViewFieldIds.length} out of ${views.flatMap((view) => view.viewFields).length} view fields that have no corresponding field metadata for workspace ${workspaceId}`,
    );

    const workspaceViewFilterRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<ViewFilterWorkspaceEntity>(
        workspaceId,
        'viewFilter',
        { shouldBypassPermissionChecks: true },
      );

    if (!dryRun) {
      await workspaceViewFilterRepository.delete({
        id: In(corruptedViewFilterIds),
      });
    }

    this.logger.log(
      `Deleted ${corruptedViewFilterIds.length} out of ${views.flatMap((view) => view.viewFilters).length} view filters that have no corresponding field metadata for workspace ${workspaceId}`,
    );

    const workspaceViewSortRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<ViewSortWorkspaceEntity>(
        workspaceId,
        'viewSort',
        { shouldBypassPermissionChecks: true },
      );

    if (!dryRun) {
      await workspaceViewSortRepository.delete({
        id: In(corruptedViewSortIds),
      });
    }

    this.logger.log(
      `Deleted ${corruptedViewSortIds.length} out of ${views.flatMap((view) => view.viewSorts).length} view sorts that have no corresponding field metadata for workspace ${workspaceId}`,
    );

    const workspaceViewGroupRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<ViewGroupWorkspaceEntity>(
        workspaceId,
        'viewGroup',
        { shouldBypassPermissionChecks: true },
      );

    if (!dryRun) {
      await workspaceViewGroupRepository.delete({
        id: In(corruptedViewGroupIds),
      });
    }

    this.logger.log(
      `Deleted ${corruptedViewGroupIds.length} out of ${views.flatMap((view) => view.viewGroups).length} view groups that have no corresponding field metadata for workspace ${workspaceId}`,
    );

    const objectMetadataIdsUsedInViews = views.map(
      (view) => view.objectMetadataId,
    );

    const objectMetadataRepository =
      queryRunner.manager.getRepository(ObjectMetadataEntity);
    const objectMetadataItems = await objectMetadataRepository.find({
      where: {
        id: In(objectMetadataIdsUsedInViews),
      },
    });

    const existingObjectMetadataIds = objectMetadataItems.map(
      (objectMetadata) => objectMetadata.id,
    );

    const corruptedViewIds = views
      .filter(
        (view) => !existingObjectMetadataIds.includes(view.objectMetadataId),
      )
      .map((view) => view.id);

    const workspaceViewRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<ViewWorkspaceEntity>(
        workspaceId,
        'view',
        { shouldBypassPermissionChecks: true },
      );

    if (!dryRun) {
      await workspaceViewRepository.delete({
        id: In(corruptedViewIds),
      });
    }

    this.logger.log(
      `Deleted ${corruptedViewIds.length} out of ${views.length} views that have no corresponding object metadata for workspace ${workspaceId}`,
    );

    return {
      corruptedViewIds,
      corruptedViewFieldIds,
      corruptedViewFilterIds,
      corruptedViewSortIds,
      corruptedViewGroupIds,
    };
  }

  private async deleteExistingCoreViewObjects(
    workspaceId: string,
    queryRunner: QueryRunner,
    dryRun: boolean,
  ): Promise<void> {
    const viewRepository = queryRunner.manager.getRepository(ViewEntity);
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
    let viewName = workspaceView.name;

    if (workspaceView.key === 'INDEX' && !viewName.includes('{')) {
      viewName = 'All {objectLabelPlural}';
    }

    const coreView: Partial<ViewEntity> = {
      id: workspaceView.id,
      name: viewName,
      objectMetadataId: workspaceView.objectMetadataId,
      type: workspaceView.type === 'table' ? ViewType.TABLE : ViewType.KANBAN,
      key:
        workspaceView.key === 'INDEX' || workspaceView.key === ViewKey.INDEX
          ? ViewKey.INDEX
          : null,
      icon: workspaceView.icon,
      position: workspaceView.position,
      isCompact: workspaceView.isCompact,
      isCustom: workspaceView.key !== 'INDEX',
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

    const repository = queryRunner.manager.getRepository(ViewEntity);

    await repository.insert(coreView);
  }

  private async migrateViewFields(
    workspaceViewFields: ViewFieldWorkspaceEntity[],
    workspaceId: string,
    queryRunner: QueryRunner,
  ): Promise<void> {
    for (const field of workspaceViewFields) {
      const coreViewField: Partial<ViewFieldEntity> = {
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

      const repository = queryRunner.manager.getRepository(ViewFieldEntity);

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

      const coreViewFilter: Partial<ViewFilterEntity> = {
        id: filter.id,
        fieldMetadataId: filter.fieldMetadataId,
        viewId: filter.viewId,
        operand: convertViewFilterOperandToCoreOperand(
          filter.operand as SharedViewFilterOperand,
        ),
        value: convertViewFilterWorkspaceValueToCoreValue(filter.value),
        viewFilterGroupId: filter.viewFilterGroupId,
        workspaceId,
        createdAt: new Date(filter.createdAt),
        updatedAt: new Date(filter.updatedAt),
        deletedAt: filter.deletedAt ? new Date(filter.deletedAt) : null,
      };

      const repository = queryRunner.manager.getRepository(ViewFilterEntity);

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

      const coreViewSort: Partial<ViewSortEntity> = {
        id: sort.id,
        fieldMetadataId: sort.fieldMetadataId,
        viewId: sort.viewId,
        direction: direction,
        workspaceId,
        createdAt: new Date(sort.createdAt),
        updatedAt: new Date(sort.updatedAt),
        deletedAt: sort.deletedAt ? new Date(sort.deletedAt) : null,
      };

      const repository = queryRunner.manager.getRepository(ViewSortEntity);

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

      const coreViewGroup: Partial<ViewGroupEntity> = {
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

      const repository = queryRunner.manager.getRepository(ViewGroupEntity);

      await repository.insert(coreViewGroup);
    }
  }

  private async migrateViewFilterGroups(
    workspaceViewFilterGroups: ViewFilterGroupWorkspaceEntity[],
    workspaceId: string,
    queryRunner: QueryRunner,
  ): Promise<void> {
    for (const filterGroup of workspaceViewFilterGroups.sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    )) {
      const coreViewFilterGroup: Partial<ViewFilterGroupEntity> = {
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

      const repository = queryRunner.manager.getRepository(
        ViewFilterGroupEntity,
      );

      await repository.insert(coreViewFilterGroup);
    }
  }
}
