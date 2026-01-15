import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { IsNull, Repository } from 'typeorm';

import {
  RunOnWorkspaceArgs,
  WorkspacesMigrationCommandRunner,
} from 'src/database/commands/command-runners/workspaces-migration.command-runner';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';
import { getMetadataRelatedMetadataNames } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-related-metadata-names.util';
import { ViewEntity } from 'src/engine/metadata-modules/view/entities/view.entity';
import { ViewType } from 'src/engine/metadata-modules/view/enums/view-type.enum';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

type KanbanViewWithNullAggregateField = {
  id: string;
  name: string;
  workspaceId: string;
  objectMetadataId: string;
  deletedAt: Date | null;
};

@Command({
  name: 'upgrade:1-16:fix-kanban-view-integrity',
  description:
    'Scan and report kanban views with null kanbanAggregateOperationFieldMetadataId (including soft deleted)',
})
export class FixKanbanViewIntegrityCommand extends WorkspacesMigrationCommandRunner {
  constructor(
    @InjectRepository(WorkspaceEntity)
    protected readonly workspaceRepository: Repository<WorkspaceEntity>,
    @InjectRepository(ViewEntity)
    private readonly viewRepository: Repository<ViewEntity>,
    protected readonly twentyORMGlobalManager: GlobalWorkspaceOrmManager,
    protected readonly dataSourceService: DataSourceService,
    private readonly workspaceCacheService: WorkspaceCacheService,
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
      `Scanning kanban views with null kanbanAggregateOperationFieldMetadataId for workspace ${workspaceId}`,
    );

    const kanbanViewsWithNullAggregateField =
      await this.findKanbanViewsWithNullAggregateField(workspaceId);

    if (kanbanViewsWithNullAggregateField.length === 0) {
      this.logger.log(
        `No kanban views with null kanbanAggregateOperationFieldMetadataId found for workspace ${workspaceId}`,
      );

      return;
    }

    this.logger.warn(
      `Found ${kanbanViewsWithNullAggregateField.length} kanban view(s) with null kanbanAggregateOperationFieldMetadataId for workspace ${workspaceId}:`,
    );

    for (const view of kanbanViewsWithNullAggregateField) {
      const softDeletedLabel = view.deletedAt ? ' [SOFT DELETED]' : '';

      this.logger.warn(
        `  - View "${view.name}" (id=${view.id}, objectMetadataId=${view.objectMetadataId})${softDeletedLabel}`,
      );
    }

    if (options.dryRun) {
      this.logger.log('Dry run mode: No changes will be applied');

      return;
    }

    await this.deleteKanbanViewsWithNullAggregateField(
      kanbanViewsWithNullAggregateField,
    );

    await this.invalidateViewCache(workspaceId);

    this.logger.log(
      `Successfully deleted ${kanbanViewsWithNullAggregateField.length} kanban view(s) with null kanbanAggregateOperationFieldMetadataId for workspace ${workspaceId}`,
    );
  }

  private async findKanbanViewsWithNullAggregateField(
    workspaceId: string,
  ): Promise<KanbanViewWithNullAggregateField[]> {
    return this.viewRepository.find({
      select: {
        id: true,
        name: true,
        workspaceId: true,
        objectMetadataId: true,
        deletedAt: true,
      },
      where: {
        workspaceId,
        type: ViewType.KANBAN,
        kanbanAggregateOperationFieldMetadataId: IsNull(),
      },
      withDeleted: true,
    });
  }

  private async deleteKanbanViewsWithNullAggregateField(
    views: KanbanViewWithNullAggregateField[],
  ): Promise<void> {
    const viewIds = views.map((view) => view.id);

    // Hard delete all views (including already soft deleted ones)
    await this.viewRepository.delete(viewIds);
  }

  private async invalidateViewCache(workspaceId: string): Promise<void> {
    const relatedMetadataNames = getMetadataRelatedMetadataNames('view');
    const relatedCacheKeysToInvalidate = relatedMetadataNames.map(
      getMetadataFlatEntityMapsKey,
    );

    this.logger.log(
      `Invalidating caches: flatViewMaps ${relatedCacheKeysToInvalidate.join(' ')}`,
    );

    await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
      'flatViewMaps',
      ...relatedCacheKeysToInvalidate,
    ]);
  }
}
