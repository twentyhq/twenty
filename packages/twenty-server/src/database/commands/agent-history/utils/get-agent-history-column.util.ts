import { type AgentHistoryStorageState } from 'src/engine/metadata-modules/ai/ai-history/types/agent-history-storage-state.type';

export const getAgentHistoryColumn = ({
  tableName,
  storage,
  columnName,
}: {
  tableName: string;
  storage: AgentHistoryStorageState['storage'];
  columnName: string;
}): string => {
  // Chat archive state must not enter the generic workspace trash lifecycle.
  return storage === 'workspace' &&
    tableName === 'agentChatThread' &&
    columnName === 'deletedAt'
    ? 'archivedAt'
    : columnName;
};
