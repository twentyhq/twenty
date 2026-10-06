import { useMutation } from '@apollo/client/react';

import { invalidateCoreWorkflowVersions } from '@/object-core/workflows/versions/utils/invalidateCoreWorkflowVersions';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { ActivateCoreWorkflowVersionDocument } from '~/generated/graphql';

export const useActivateWorkflowVersion = () => {
  const apolloCoreClient = useApolloCoreClient();
  const [mutate] = useMutation(ActivateCoreWorkflowVersionDocument, {
    client: apolloCoreClient,
  });

  const activateWorkflowVersion = async ({
    workflowVersionId,
  }: {
    workflowVersionId: string;
    workflowId: string;
  }) => {
    await mutate({
      variables: { coreWorkflowVersionId: workflowVersionId },
    });
    await invalidateCoreWorkflowVersions(apolloCoreClient);
  };

  return { activateWorkflowVersion };
};
