import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { ActiveOrSuspendedWorkspacesMigrationCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspaces-migration.command-runner';
import { ADD_MISSING_SYSTEM_FIELDS_TO_STANDARD_OBJECTS_1771420702241 } from 'src/database/commands/upgrade-version-command/workspace-migrations/1771420702241-add-missing-system-fields-to-standard-objects';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationRunnerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/services/workspace-migration-runner.service';

const FIRST_FIELD_UNIVERSAL_IDENTIFIER =
  ADD_MISSING_SYSTEM_FIELDS_TO_STANDARD_OBJECTS_1771420702241.actions[0]
    .flatEntity.universalIdentifier;

@Command({
  name: 'upgrade:1-19:add-missing-system-fields-to-standard-objects',
  description:
    'Add missing system fields (position, searchVector, createdBy, updatedBy) to standard objects',
})
export class AddMissingSystemFieldsToStandardObjectsCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  constructor(
    @InjectRepository(WorkspaceEntity)
    protected readonly workspaceRepository: Repository<WorkspaceEntity>,
    protected readonly twentyORMGlobalManager: GlobalWorkspaceOrmManager,
    protected readonly dataSourceService: DataSourceService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceMigrationRunnerService: WorkspaceMigrationRunnerService,
  ) {
    super(workspaceRepository, twentyORMGlobalManager, dataSourceService);
  }

  // The entire migration runs in a single transaction, so checking the first
  // field is enough to know whether the migration has already been applied.
  // In the future we will maintain a list of passed migrations
  private async hasAlreadyRun(workspaceId: string): Promise<boolean> {
    const { flatFieldMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatFieldMetadataMaps',
      ]);

    return isDefined(
      flatFieldMetadataMaps.byUniversalIdentifier[
        FIRST_FIELD_UNIVERSAL_IDENTIFIER
      ],
    );
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const dryRun = options?.dryRun ?? false;

    this.logger.log(
      `${dryRun ? '[DRY RUN] ' : ''}Adding missing system fields to standard objects in workspace ${workspaceId}`,
    );

    if (dryRun) {
      this.logger.log(
        `[DRY RUN] Would add ${ADD_MISSING_SYSTEM_FIELDS_TO_STANDARD_OBJECTS_1771420702241.actions.length} missing system fields to standard objects in workspace ${workspaceId}. Skipping.`,
      );

      return;
    }

    if (await this.hasAlreadyRun(workspaceId)) {
      this.logger.log(
        `Migration already applied for workspace ${workspaceId}, skipping.`,
      );

      return;
    }

    await this.workspaceMigrationRunnerService.run({
      workspaceId,
      workspaceMigration:
        ADD_MISSING_SYSTEM_FIELDS_TO_STANDARD_OBJECTS_1771420702241,
    });

    this.logger.log(
      `Successfully added missing system fields to standard objects in workspace ${workspaceId}`,
    );
  }
}
