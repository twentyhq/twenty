import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type RecordGqlOperationFilter } from 'twenty-shared/types';

// Deleted chats stay listed so they can be restored. Anyone who reads a
// workflow run reads its agent's conversations, which belong to the run
// rather than to the chat list
export const buildAgentChatThreadListFilter = (
  chatObjectMetadataItem: Pick<EnrichedObjectMetadataItem, 'fields'>,
): RecordGqlOperationFilter => {
  const includeDeletedFilter: RecordGqlOperationFilter = {
    or: [{ deletedAt: { is: 'NULL' } }, { deletedAt: { is: 'NOT_NULL' } }],
  };
  const canNameWorkflowRun = chatObjectMetadataItem.fields.some(
    ({ name }) => name === 'workflowRun',
  );

  return canNameWorkflowRun
    ? { and: [{ workflowRunId: { is: 'NULL' } }, includeDeletedFilter] }
    : includeDeletedFilter;
};
