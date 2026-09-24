import { Command } from 'nest-commander';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

const AGENT_HISTORY_CORE_FOREIGN_KEYS = [
  { tableName: 'agentMessagePart', constraintName: 'FK_agent_history_fileId' },
  {
    tableName: 'agentChatThread',
    constraintName: 'FK_agent_history_userWorkspaceId',
  },
] as const;

const LOCK_NOT_AVAILABLE_ERROR_CODE = '55P03';
const MAX_DROP_ATTEMPTS = 5;

@RegisteredWorkspaceCommand('2.43.0', 1790258659725)
@Command({
  name: 'upgrade:2-43:drop-agent-history-core-foreign-keys',
  description:
    'Drop the per-workspace agent history foreign keys that reference core.file and core.userWorkspace',
})
export class DropAgentHistoryCoreForeignKeysCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace(args: RunOnWorkspaceArgs): Promise<void> {
    await this.up(args);
  }

  async up({ workspaceId, options, dataSource }: RunOnWorkspaceArgs) {
    if (!isDefined(dataSource)) {
      throw new Error('Workspace data source is required');
    }

    const schemaName = getWorkspaceSchemaName(workspaceId);

    for (const {
      tableName,
      constraintName,
    } of AGENT_HISTORY_CORE_FOREIGN_KEYS) {
      const existing = await dataSource.query(
        `SELECT 1 FROM pg_constraint c
         JOIN pg_class t ON t.oid = c.conrelid
         JOIN pg_namespace n ON n.oid = t.relnamespace
         WHERE n.nspname = $1 AND t.relname = $2 AND c.conname = $3`,
        [schemaName, tableName, constraintName],
      );

      if (!isNonEmptyArray(existing)) {
        continue;
      }

      if (options.dryRun) {
        this.logger.log(
          `Would drop ${constraintName} on ${schemaName}.${tableName}`,
        );
        continue;
      }

      await this.dropConstraintWithShortLockTimeout({
        dataSource,
        schemaName,
        tableName,
        constraintName,
      });

      this.logger.log(
        `Dropped ${constraintName} on ${schemaName}.${tableName}`,
      );
    }
  }

  // The dropped constraints must not come back: each one adds triggers and a
  // lock dependency on a core table shared by every workspace.
  async down(): Promise<void> {}

  private async dropConstraintWithShortLockTimeout({
    dataSource,
    schemaName,
    tableName,
    constraintName,
  }: {
    dataSource: NonNullable<RunOnWorkspaceArgs['dataSource']>;
    schemaName: string;
    tableName: string;
    constraintName: string;
  }): Promise<void> {
    for (let attempt = 1; ; attempt++) {
      try {
        // Dropping the constraint also locks the referenced core table, so
        // give up quickly instead of queueing live core traffic behind us.
        await dataSource.transaction(async (manager) => {
          await manager.query("SET LOCAL lock_timeout = '2s'");
          await manager.query(
            `ALTER TABLE ${escapeIdentifier(schemaName)}.${escapeIdentifier(tableName)} DROP CONSTRAINT IF EXISTS ${escapeIdentifier(constraintName)}`,
          );
        });

        return;
      } catch (error) {
        if (
          (error as { code?: string }).code !== LOCK_NOT_AVAILABLE_ERROR_CODE ||
          attempt >= MAX_DROP_ATTEMPTS
        ) {
          throw error;
        }

        await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
      }
    }
  }
}
