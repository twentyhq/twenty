import { DeactivateCoreWorkflowVersionDocument } from '~/generated/graphql';
import { invalidateCoreWorkflowVersions } from '@/object-core/workflows/versions/utils/invalidateCoreWorkflowVersions';
import { useMutation } from '@apollo/client/react';

import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';

export const useDeactivateWorkflowVersion = () => {
  const apolloCoreClient = useApolloCoreClient();
  const [mutateCore] = useMutation(DeactivateCoreWorkflowVersionDocument, {
    client: apolloCoreClient,
  });

  const deactivateWorkflowVersion = async ({
    workflowVersionId,
  }: {
    workflowVersionId: string;
  }) => {
    await mutateCore({
      variables: { coreWorkflowVersionId: workflowVersionId },
    });
    await invalidateCoreWorkflowVersions(apolloCoreClient);
  };

  return { deactivateWorkflowVersion };
};
