import { type AgentHistoryStorageState } from 'src/engine/metadata-modules/ai/ai-history/types/agent-history-storage-state.type';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

export const getAgentHistoryTable = ({
  workspaceId,
  storage,
  name,
}: {
  workspaceId: string;
  storage: AgentHistoryStorageState['storage'];
  name: string;
}): string =>
  `${escapeIdentifier(storage === 'core' ? 'core' : getWorkspaceSchemaName(workspaceId))}.${escapeIdentifier(name)}`;
