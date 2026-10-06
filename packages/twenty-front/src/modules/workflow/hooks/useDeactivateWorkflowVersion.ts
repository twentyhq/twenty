import { useMutation } from '@apollo/client/react';

import { invalidateCoreWorkflowVersions } from '@/object-core/workflows/versions/utils/invalidateCoreWorkflowVersions';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { DeactivateCoreWorkflowVersionDocument } from '~/generated/graphql';

export const useDeactivateWorkflowVersion = () => {
  const apolloCoreClient = useApolloCoreClient();
  const [mutate] = useMutation(DeactivateCoreWorkflowVersionDocument, {
    client: apolloCoreClient,
  });

  const deactivateWorkflowVersion = async ({
    workflowVersionId,
  }: {
    workflowVersionId: string;
  }) => {
    await mutate({
      variables: { coreWorkflowVersionId: workflowVersionId },
    });
    await invalidateCoreWorkflowVersions(apolloCoreClient);
  };

  return { deactivateWorkflowVersion };
};
