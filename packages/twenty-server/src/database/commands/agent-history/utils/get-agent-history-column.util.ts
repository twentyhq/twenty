import { type AgentHistoryStorageState } from 'src/engine/metadata-modules/ai/ai-history/types/agent-history-storage-state.type';
import { type AgentChatThreadOwnerColumn } from 'src/engine/metadata-modules/ai/ai-history/utils/get-agent-chat-thread-owner-column.util';

export const getAgentHistoryColumn = ({
  tableName,
  storage,
  columnName,
  workspaceOwnerColumn = 'userWorkspaceId',
}: {
  tableName: string;
  storage: AgentHistoryStorageState['storage'];
  columnName: string;
  workspaceOwnerColumn?: AgentChatThreadOwnerColumn;
}): string => {
  if (storage !== 'workspace' || tableName !== 'agentChatThread') {
    return columnName;
  }

  // Chat archive state must not enter the generic workspace trash lifecycle.
  if (columnName === 'deletedAt') {
    return 'archivedAt';
  }

  return columnName === 'userWorkspaceId' ? workspaceOwnerColumn : columnName;
};
