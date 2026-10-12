import { AgentHistoryMigrationStateException } from 'src/database/commands/agent-history/agent-history-migration-state.exception';
import { type AGENT_HISTORY_TABLES } from 'src/database/commands/agent-history/agent-history-tables.constant';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, type EntityManager } from 'typeorm';
import { isNonEmptyString } from '@sniptt/guards';

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

// Commands after 2.42 run once its move has finished on every workspace, so
// history is always in workspace storage by then
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

    return this.dataSource.transaction((manager) =>
      work({ manager, table: getWorkspaceAgentHistoryTable(workspaceId) }),
    );
  }
}
