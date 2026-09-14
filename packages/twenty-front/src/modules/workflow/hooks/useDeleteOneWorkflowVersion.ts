import { invalidateCoreWorkflowVersions } from '@/object-core/workflows/versions/utils/invalidateCoreWorkflowVersions';

import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { useDeleteOneRecord } from '@/object-record/hooks/useDeleteOneRecord';
import { useEvictDiscardedDraftFromWorkflowCache } from '@/workflow/hooks/useEvictDiscardedDraftFromWorkflowCache';

export const useDeleteOneWorkflowVersion = () => {
  const apolloCoreClient = useApolloCoreClient();
  const { evictDiscardedDraftFromWorkflowCache } =
    useEvictDiscardedDraftFromWorkflowCache();

  const { deleteOneRecord } = useDeleteOneRecord({
    objectNameSingular: CoreObjectNameSingular.WorkflowVersion,
  });

  const deleteOneWorkflowVersion = async ({
    workflowVersionId,
  }: {
    workflowVersionId: string;
  }) => {
    await deleteOneRecord(workflowVersionId);
    evictDiscardedDraftFromWorkflowCache(workflowVersionId);

    await invalidateCoreWorkflowVersions(apolloCoreClient);
  };

  return { deleteOneWorkflowVersion };
};
