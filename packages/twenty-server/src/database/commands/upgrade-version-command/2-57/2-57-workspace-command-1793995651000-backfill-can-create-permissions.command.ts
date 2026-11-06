import { InjectDataSource } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { DataSource } from 'typeorm';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@RegisteredWorkspaceCommand('2.57.0', 1793995651000)
@Command({
  name: 'upgrade:2-57:backfill-can-create-permissions',
  description:
    'Grant creating records wherever updating them is granted, since creating was part of updating until now',
})
export class BackfillCanCreatePermissionsCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    if (options.dryRun) {
      this.logger.log(
        `Would backfill create permissions for workspace ${workspaceId}`,
      );

      return;
    }

    await this.coreDataSource.transaction(async (manager) => {
      await manager.query(
        `UPDATE core."role"
         SET "canCreateAllObjectRecords" = true
         WHERE "workspaceId" = $1
           AND "canUpdateAllObjectRecords" = true
           AND "canCreateAllObjectRecords" = false`,
        [workspaceId],
      );
      await manager.query(
        `UPDATE core."objectPermission"
         SET "canCreateObjectRecords" = "canUpdateObjectRecords"
         WHERE "workspaceId" = $1
           AND "canCreateObjectRecords" IS NULL
           AND "canUpdateObjectRecords" IS NOT NULL`,
        [workspaceId],
      );
      await manager.query(
        `UPDATE core."rowLevelPermissionPredicateGroup"
         SET "canCreateRecords" = true
         WHERE "workspaceId" = $1
           AND "canUpdateRecords" = true
           AND "canCreateRecords" = false`,
        [workspaceId],
      );
    });

    await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
      'flatRoleMaps',
      'flatObjectPermissionMaps',
      'flatRowLevelPermissionPredicateGroupMaps',
    ]);
  }
}
