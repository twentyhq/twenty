import { isDefined } from 'twenty-shared/utils';
import { AgentHistoryMigrationStateException } from 'src/database/commands/agent-history/agent-history-migration-state.exception';
import { type AGENT_HISTORY_TABLES } from 'src/database/commands/agent-history/agent-history-tables.constant';
import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, type EntityManager } from 'typeorm';
import { isNonEmptyString } from '@sniptt/guards';

import { AGENT_HISTORY_MIGRATION_STORAGE_KEY } from 'src/database/commands/agent-history/agent-history-migration-storage-key.constant';
import { AgentHistoryMigrationStateService } from 'src/database/commands/agent-history/agent-history-migration-state.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

export type AgentHistoryUpgradeStorageContext = {
  manager: EntityManager;
  table: (name: (typeof AGENT_HISTORY_TABLES)[number]['name']) => string;
};

const getWorkspaceAgentHistoryTable =
  (workspaceId: string) =>
  (name: (typeof AGENT_HISTORY_TABLES)[number]['name']) =>
    `${escapeIdentifier(getWorkspaceSchemaName(workspaceId))}.${escapeIdentifier(name)}`;

@Injectable()
export class AgentHistoryUpgradeStorageService extends AgentHistoryMigrationStateService {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {
    super();
  }

  async run<TResult>(
    workspaceId: string,
    work: (context: AgentHistoryUpgradeStorageContext) => Promise<TResult>,
  ): Promise<TResult> {
    if (!isNonEmptyString(workspaceId)) {
      throw new AgentHistoryMigrationStateException(
        'INVALID_WORKSPACE',
        'Agent history requires a workspace ID',
      );
    }

    const runner = this.dataSource.createQueryRunner('master');
    try {
      await runner.connect();
      await runner.startTransaction();
      // The route cannot change between this primary read and the operation.
      await runner.query(
        'SELECT pg_advisory_xact_lock_shared(hashtextextended($1, 0))',
        [`${AGENT_HISTORY_MIGRATION_STORAGE_KEY}:${workspaceId}`],
      );
      const state = await this.readState(runner, workspaceId);
      if (state.migration) {
        throw new ServiceUnavailableException(
          'AI history is being migrated. Please retry shortly.',
        );
      }
      // History still in core belongs to a workspace whose 2.42 upgrade has
      // not finished. Serving the empty workspace tables would hide it, and
      // writing to them would be wiped when the copy resumes.
      if (state.storage !== 'workspace') {
        throw new ServiceUnavailableException(
          'AI history is unavailable until this workspace finishes upgrading.',
        );
      }
      const result = await work({
        manager: runner.manager,
        table: getWorkspaceAgentHistoryTable(workspaceId),
      });
      await runner.commitTransaction();
      return result;
    } catch (error) {
      if (runner.isTransactionActive) {
        await runner.rollbackTransaction();
      }
      throw error;
    } finally {
      await runner.release();
    }
  }

  async runReadOnlyReport<TResult>(
    workspaceIds: string[],
    work: (context: {
      manager: EntityManager;
      partitions: {
        workspaceIds: string[];
        table: AgentHistoryUpgradeStorageContext['table'];
      }[];
    }) => Promise<TResult>,
  ): Promise<TResult> {
    const runner = this.dataSource.createQueryRunner('master');
    try {
      await runner.connect();
      // One MVCC snapshot sees both the route and its data before or after a
      // cutover. Reports need no per-workspace locks or second pool.
      await runner.startTransaction('REPEATABLE READ');
      await runner.query('SET TRANSACTION READ ONLY');
      const states = await this.readStates(runner, workspaceIds);
      const partitions = [...states]
        .filter(
          ([, state]) =>
            state.storage === 'workspace' && !isDefined(state.migration),
        )
        .map(([workspaceId]) => ({
          workspaceIds: [workspaceId],
          table: getWorkspaceAgentHistoryTable(workspaceId),
        }));
      const result = await work({ manager: runner.manager, partitions });
      await runner.commitTransaction();
      return result;
    } catch (error) {
      if (runner.isTransactionActive) {
        await runner.rollbackTransaction();
      }
      throw error;
    } finally {
      await runner.release();
    }
  }
}
