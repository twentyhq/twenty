import { useMutation } from '@apollo/client/react';

import { DISCARD_CORE_WORKFLOW_DRAFT } from '@/object-core/workflows/graphql/mutations/discardCoreWorkflowDraft';
import { invalidateCoreWorkflowVersions } from '@/object-core/workflows/versions/utils/invalidateCoreWorkflowVersions';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useEvictDiscardedDraftFromWorkflowCache } from '@/workflow/hooks/useEvictDiscardedDraftFromWorkflowCache';
import {
  type DiscardCoreWorkflowDraftMutation,
  type DiscardCoreWorkflowDraftMutationVariables,
} from '~/generated/graphql';

export const useDiscardWorkflowDraft = () => {
  const apolloCoreClient = useApolloCoreClient();
  const { evictDiscardedDraftFromWorkflowCache } =
    useEvictDiscardedDraftFromWorkflowCache();

  const [discardCoreWorkflowDraftMutation] = useMutation<
    DiscardCoreWorkflowDraftMutation,
    DiscardCoreWorkflowDraftMutationVariables
  >(DISCARD_CORE_WORKFLOW_DRAFT, { client: apolloCoreClient });

  const discardWorkflowDraft = async ({
    workspaceWorkflowVersionId,
  }: {
    workspaceWorkflowVersionId: string;
  }) => {
    await discardCoreWorkflowDraftMutation({
      variables: { input: { workspaceWorkflowVersionId } },
    });

    evictDiscardedDraftFromWorkflowCache(workspaceWorkflowVersionId);

    await invalidateCoreWorkflowVersions(apolloCoreClient);
  };

  return { discardWorkflowDraft };
};
