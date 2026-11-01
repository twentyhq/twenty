import { ActivateCoreWorkflowVersionDocument } from '~/generated/graphql';
import { invalidateCoreWorkflowVersions } from '@/object-core/workflows/versions/utils/invalidateCoreWorkflowVersions';
import { useMutation } from '@apollo/client/react';

import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';

export const useActivateWorkflowVersion = () => {
  const apolloCoreClient = useApolloCoreClient();
  const [mutateCore] = useMutation(ActivateCoreWorkflowVersionDocument, {
    client: apolloCoreClient,
  });

  const activateWorkflowVersion = async ({
    workflowVersionId,
  }: {
    workflowVersionId: string;
  }) => {
    await mutateCore({
      variables: { coreWorkflowVersionId: workflowVersionId },
    });
    await invalidateCoreWorkflowVersions(apolloCoreClient);
  };

  return { activateWorkflowVersion };
};
