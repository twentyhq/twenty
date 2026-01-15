import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { Repository } from 'typeorm';

import {
  RunOnWorkspaceArgs,
  WorkspacesMigrationCommandRunner,
} from 'src/database/commands/command-runners/workspaces-migration.command-runner';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { ViewService } from 'src/engine/metadata-modules/view/services/view.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { STANDARD_OBJECTS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-object.constant';

@Command({
  name: 'upgrade:1-16:fix-kanban-view-aggregate-field',
  description:
    'Fix standard task By Status kanban view with null kanbanAggregateOperationFieldMetadataId',
})
export class FixKanbanViewAggregateFieldCommand extends WorkspacesMigrationCommandRunner {
  constructor(
    @InjectRepository(WorkspaceEntity)
    protected readonly workspaceRepository: Repository<WorkspaceEntity>,
    protected readonly twentyORMGlobalManager: GlobalWorkspaceOrmManager,
    protected readonly dataSourceService: DataSourceService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly viewService: ViewService,
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
      `Checking standard task "By Status" kanban view for workspace ${workspaceId}`,
    );

    const { flatFieldMetadataMaps, flatViewMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatFieldMetadataMaps', 'flatViewMaps'],
        },
      );

    const byStatusView = findFlatEntityByUniversalIdentifier({
      flatEntityMaps: flatViewMaps,
      universalIdentifier:
        STANDARD_OBJECTS.task.views.byStatus.universalIdentifier,
    });

    if (!isDefined(byStatusView)) {
      this.logger.log(
        `Standard task "By Status" view not found for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    if (isDefined(byStatusView.kanbanAggregateOperationFieldMetadataId)) {
      this.logger.log(
        `Standard task "By Status" view already has kanbanAggregateOperationFieldMetadataId set for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    this.logger.warn(
      `Found standard task "By Status" view (id=${byStatusView.id}) with null kanbanAggregateOperationFieldMetadataId for workspace ${workspaceId}`,
    );

    const statusField = findFlatEntityByUniversalIdentifier({
      flatEntityMaps: flatFieldMetadataMaps,
      universalIdentifier:
        STANDARD_OBJECTS.task.fields.status.universalIdentifier,
    });

    if (!isDefined(statusField)) {
      this.logger.error(
        `Standard task "status" field not found for workspace ${workspaceId}, cannot fix view`,
      );

      return;
    }

    if (options.dryRun) {
      this.logger.log(
        `Dry run mode: Would update view "${byStatusView.name}" (id=${byStatusView.id}) with status field metadata id ${statusField.id}`,
      );

      return;
    }

    try {
      await this.viewService.updateOne({
        updateViewInput: {
          id: byStatusView.id,
          kanbanAggregateOperationFieldMetadataId: statusField.id,
        },
        isSystemBuild: true,
        workspaceId,
      });

      this.logger.log(
        `Successfully fixed view "${byStatusView.name}" (id=${byStatusView.id}) with status field metadata id ${statusField.id}`,
      );

      await this.invalidateViewCache(workspaceId);
    } catch (error) {
      this.logger.error(
        `Failed to update view "${byStatusView.name}" (id=${byStatusView.id}): ${error.message}`,
      );
    }
  }

  private async invalidateViewCache(workspaceId: string): Promise<void> {
    this.logger.log('Invalidating view cache');

    await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
      'flatViewMaps',
    ]);
  }
}
