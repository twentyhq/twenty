import { type AgentHistoryMigrationState } from 'src/database/commands/agent-history/agent-history-migration-state.type';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

export const getAgentHistoryTable = ({
  workspaceId,
  storage,
  name,
}: {
  workspaceId: string;
  storage: AgentHistoryMigrationState['storage'];
  name: string;
}): string =>
  `${escapeIdentifier(storage === 'core' ? 'core' : getWorkspaceSchemaName(workspaceId))}.${escapeIdentifier(name)}`;
