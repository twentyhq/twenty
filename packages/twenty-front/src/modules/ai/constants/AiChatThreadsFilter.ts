import { type RecordGqlOperationFilter } from 'twenty-shared/types';

// Deleted chats stay listed for restore
export const AI_CHAT_THREADS_FILTER: RecordGqlOperationFilter = {
  or: [{ deletedAt: { is: 'NULL' } }, { deletedAt: { is: 'NOT_NULL' } }],
};
