import { InjectDataSource } from '@nestjs/typeorm';
import { Command } from 'nest-commander';
import { DataSource } from 'typeorm';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { buildTypedAccessGroupStatements } from 'src/database/commands/upgrade-version-command/2-61/utils/build-typed-access-group-statements.util';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';
import { AccessGroupSyncSchedulerService } from 'src/engine/permissions/internal/access-group/services/access-group-sync-scheduler.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';

@RegisteredWorkspaceCommand('2.61.0', 1795264768000)
@Command({
  name: 'upgrade:2-61:type-access-groups',
  description:
    'Give accessGroup an explicit type and rule shape instead of a role and a rule, and schedule the sync that rebuilds it',
})
export class TypeAccessGroupsCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly accessGroupSyncSchedulerService: AccessGroupSyncSchedulerService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const schemaName = getWorkspaceSchemaName(workspaceId);
    const [{ hasRoleIdColumn }]: { hasRoleIdColumn: boolean }[] =
      await this.dataSource.query(
        `SELECT EXISTS (
           SELECT 1 FROM pg_attribute
           WHERE attrelid = to_regclass($1) AND attname = 'roleId' AND NOT attisdropped
         ) AS "hasRoleIdColumn"`,
        [`${escapeIdentifier(schemaName)}."accessGroup"`],
      );

    if (!hasRoleIdColumn) {
      return;
    }

    if (options.dryRun ?? false) {
      this.logger.log(
        `[DRY RUN] Would type the accessGroup table of workspace ${workspaceId}`,
      );

      return;
    }

    await this.dataSource.transaction(async (entityManager) => {
      for (const statement of buildTypedAccessGroupStatements({
        schemaName,
      })) {
        await entityManager.query(statement);
      }
    });

    await this.accessGroupSyncSchedulerService.scheduleSyncIfEnabled({ workspaceId });

    this.logger.log(`Typed the accessGroup table of workspace ${workspaceId}`);
  }
}
