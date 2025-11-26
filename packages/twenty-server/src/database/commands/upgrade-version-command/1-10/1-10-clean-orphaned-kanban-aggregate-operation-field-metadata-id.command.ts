import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';
import { In, IsNull, Not, Repository } from 'typeorm';

import {
  ActiveOrSuspendedWorkspacesMigrationCommandRunner,
} from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspaces-migration.command-runner';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ViewEntity } from 'src/engine/metadata-modules/view/entities/view.entity';
import { ViewType } from 'src/engine/metadata-modules/view/enums/view-type.enum';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';

@Command({
  name: 'upgrade:1-10:clean-orphaned-kanban-aggregate-operation-field-metadata-id',
  description:
    "Delete all kanbanAggregateOperationFieldMetadataId in views that don't map to a real fieldMetadata (this is because we want to introduce a FK later)",
})
export class CleanOrphanedKanbanAggregateOperationFieldMetadataIdCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  constructor(
    @InjectRepository(WorkspaceEntity)
    protected readonly workspaceRepository: Repository<WorkspaceEntity>,
    protected readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    protected readonly dataSourceService: DataSourceService,
    @InjectRepository(ViewEntity)
    private readonly viewRepository: Repository<ViewEntity>,
    @InjectRepository(FieldMetadataEntity)
    private readonly fieldMetadataRepository: Repository<FieldMetadataEntity>,
  ) {
    super(workspaceRepository, twentyORMGlobalManager, dataSourceService);
  }

  override async runOnWorkspace({
    workspaceId,
    index,
    total,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    this.logger.log(
      `[${index + 1}/${total}] Cleaning orphaned kanbanAggregateOperationFieldMetadataId for workspace ${workspaceId}`,
    );

    const existingFieldMetadataIds = await this.fieldMetadataRepository.find({
      where: { workspaceId },
      select: ['id'],
    });

    const existingFieldMetadataIdSet = new Set(
      existingFieldMetadataIds.map((fm) => fm.id),
    );

    const viewsWithOrphanedFieldMetadata = await this.viewRepository.find({
      where: {
        workspaceId,
        kanbanAggregateOperationFieldMetadataId: Not(IsNull()),
      },
      select: ['id', 'kanbanAggregateOperationFieldMetadataId', 'type'],
    });

    const orphanedViews = viewsWithOrphanedFieldMetadata.filter(
      (view) =>
        isDefined(view.kanbanAggregateOperationFieldMetadataId) &&
        !existingFieldMetadataIdSet.has(
          view.kanbanAggregateOperationFieldMetadataId,
        ),
    );

    if (orphanedViews.length === 0) {
      this.logger.log(
        'No orphaned kanbanAggregateOperationFieldMetadataId references found',
      );

      return;
    }

    const kanbanViewsToDelete = orphanedViews.filter(
      (view) => view.type === ViewType.KANBAN,
    );
    const otherViewsToUpdate = orphanedViews.filter(
      (view) => view.type !== ViewType.KANBAN,
    );

    let deletedCount = 0;
    let updatedCount = 0;

    if (!options.dryRun) {
      if (kanbanViewsToDelete.length > 0) {
        const kanbanViewIds = kanbanViewsToDelete.map((view) => view.id);

        await this.viewRepository.delete({ id: In(kanbanViewIds) });
        deletedCount = kanbanViewsToDelete.length;
      }

      if (otherViewsToUpdate.length > 0) {
        const otherViewIds = otherViewsToUpdate.map((view) => view.id);

        await this.viewRepository.update(
          { id: In(otherViewIds) },
          { kanbanAggregateOperationFieldMetadataId: null },
        );
        updatedCount = otherViewsToUpdate.length;
      }
    } else {
      deletedCount = kanbanViewsToDelete.length;
      updatedCount = otherViewsToUpdate.length;
    }

    this.logger.log(
      `${options.dryRun ? 'DRY RUN - Would have' : ''}Deleted ${deletedCount} KANBAN views and updated ${updatedCount} other views with orphaned kanbanAggregateOperationFieldMetadataId references`,
    );
  }
}
