import { type RecordGqlOperationFilter } from 'twenty-shared/types';

// Deleted chats stay listed for restore
export const AGENT_CHAT_THREAD_LIST_FILTER: RecordGqlOperationFilter = {
  or: [{ deletedAt: { is: 'NULL' } }, { deletedAt: { is: 'NOT_NULL' } }],
};
