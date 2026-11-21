import { InjectDataSource } from '@nestjs/typeorm';
import { Command } from 'nest-commander';
import { isNonEmptyArray } from 'twenty-shared/utils';
import { DataSource } from 'typeorm';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { buildTypedAccessGroupStatements } from 'src/database/commands/upgrade-version-command/2-61/utils/build-typed-access-group-statements.util';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';

@RegisteredWorkspaceCommand('2.61.0', 1795260363000)
@Command({
  name: 'upgrade:2-61:type-access-groups',
  description:
    'Give accessGroup an explicit type and rule shape instead of a role and a rule, emptying it for the next sync',
})
export class TypeAccessGroupsCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const schemaName = getWorkspaceSchemaName(workspaceId);
    const legacyColumns: { column_name: string }[] = await this.dataSource.query(
      `SELECT column_name FROM information_schema.columns
       WHERE table_schema = $1 AND table_name = 'accessGroup' AND column_name = 'roleId'`,
      [schemaName],
    );

    if (!isNonEmptyArray(legacyColumns)) {
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

    this.logger.log(`Typed the accessGroup table of workspace ${workspaceId}`);
  }
}
