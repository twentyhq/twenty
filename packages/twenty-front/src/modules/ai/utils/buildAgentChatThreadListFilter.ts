import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type RecordGqlOperationFilter } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

// Deleted chats stay listed for restore; a workflow run's conversation is listed for the member it is routed to.
export const buildAgentChatThreadListFilter = ({
  chatObjectMetadataItem,
  currentWorkspaceMemberId,
}: {
  chatObjectMetadataItem: Pick<EnrichedObjectMetadataItem, 'fields'>;
  currentWorkspaceMemberId: string | undefined;
}): RecordGqlOperationFilter => {
  const includeDeletedFilter: RecordGqlOperationFilter = {
    or: [{ deletedAt: { is: 'NULL' } }, { deletedAt: { is: 'NOT_NULL' } }],
  };
  const canNameWorkflowRun = chatObjectMetadataItem.fields.some(
    ({ name }) => name === 'workflowRun',
  );

  if (!canNameWorkflowRun) {
    return includeDeletedFilter;
  }

  return {
    and: [
      {
        or: [
          { workflowRunId: { is: 'NULL' } },
          ...(isDefined(currentWorkspaceMemberId)
            ? [{ workspaceMemberId: { eq: currentWorkspaceMemberId } }]
            : []),
        ],
      },
      includeDeletedFilter,
    ],
  };
};
