import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';
import { In, IsNull, Not, Repository } from 'typeorm';

import {
  ActiveOrSuspendedWorkspacesMigrationCommandRunner,
  type RunOnWorkspaceArgs,
} from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ViewEntity } from 'src/engine/metadata-modules/view/entities/view.entity';
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
    @InjectRepository(ViewEntity)
    private readonly viewRepository: Repository<ViewEntity>,
    @InjectRepository(FieldMetadataEntity)
    private readonly fieldMetadataRepository: Repository<FieldMetadataEntity>,
  ) {
    super(workspaceRepository, twentyORMGlobalManager);
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
      select: ['id', 'kanbanAggregateOperationFieldMetadataId'],
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

    const orphanedViewIds = orphanedViews.map((view) => view.id);

    if (!options.dryRun) {
      await this.viewRepository.update(
        { id: In(orphanedViewIds) },
        { kanbanAggregateOperationFieldMetadataId: null },
      );
    }

    this.logger.log(
      `${options.dryRun ? 'DRY RUN - Would have' : ''}Cleaned ${orphanedViews.length} orphaned kanbanAggregateOperationFieldMetadataId references`,
    );
  }
}
