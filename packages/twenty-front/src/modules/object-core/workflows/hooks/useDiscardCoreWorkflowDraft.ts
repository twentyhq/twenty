import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { useMutation } from '@apollo/client/react';

import { DISCARD_CORE_WORKFLOW_DRAFT } from '@/object-core/workflows/graphql/mutations/discardCoreWorkflowDraft';
import { invalidateCoreWorkflowVersions } from '@/object-core/workflows/versions/utils/invalidateCoreWorkflowVersions';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import {
  type DiscardCoreWorkflowDraftMutation,
  type DiscardCoreWorkflowDraftMutationVariables,
} from '~/generated/graphql';

export const useDiscardCoreWorkflowDraft = () => {
  const { closeSidePanelMenu } = useSidePanelMenu();
  const apolloCoreClient = useApolloCoreClient();

  const [discardCoreWorkflowDraftMutation] = useMutation<
    DiscardCoreWorkflowDraftMutation,
    DiscardCoreWorkflowDraftMutationVariables
  >(DISCARD_CORE_WORKFLOW_DRAFT, { client: apolloCoreClient });

  const discardCoreWorkflowDraft = async ({
    coreWorkflowVersionId,
  }: {
    coreWorkflowVersionId: string;
  }) => {
    await discardCoreWorkflowDraftMutation({
      variables: { input: { coreWorkflowVersionId } },
    });

    closeSidePanelMenu();
    apolloCoreClient.cache.evict({
      id: apolloCoreClient.cache.identify({
        __typename: 'CoreWorkflowVersionDTO',
        id: coreWorkflowVersionId,
      }),
    });

    await invalidateCoreWorkflowVersions(apolloCoreClient);
  };

  return { discardCoreWorkflowDraft };
};
