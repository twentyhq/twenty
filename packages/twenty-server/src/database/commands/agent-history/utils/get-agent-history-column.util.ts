import { type AgentHistoryMigrationState } from 'src/database/commands/agent-history/agent-history-migration-state.type';

export const getAgentHistoryColumn = ({
  tableName,
  storage,
  columnName,
}: {
  tableName: string;
  storage: AgentHistoryMigrationState['storage'];
  columnName: string;
}): string => {
  // Chat archive state must not enter the generic workspace trash lifecycle.
  return storage === 'workspace' &&
    tableName === 'agentChatThread' &&
    columnName === 'deletedAt'
    ? 'archivedAt'
    : columnName;
};
