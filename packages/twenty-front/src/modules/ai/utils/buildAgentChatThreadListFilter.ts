import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type RecordGqlOperationFilter } from 'twenty-shared/types';

// Deleted chats stay listed for restore; workflow run conversations belong to the run, not the list.
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
