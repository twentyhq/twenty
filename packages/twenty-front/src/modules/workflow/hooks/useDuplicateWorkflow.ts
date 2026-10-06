import { useMutation } from '@apollo/client/react';

import { invalidateCoreWorkflowVersions } from '@/object-core/workflows/versions/utils/invalidateCoreWorkflowVersions';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { DuplicateCoreWorkflowDocument } from '~/generated/graphql';

export type DuplicateWorkflowInput = {
  workflowIdToDuplicate: string;
  workflowVersionIdToCopy: string;
};

export const useDuplicateWorkflow = () => {
  const apolloCoreClient = useApolloCoreClient();
  const [mutate] = useMutation(DuplicateCoreWorkflowDocument, {
    client: apolloCoreClient,
  });

  const duplicateWorkflow = async (input: DuplicateWorkflowInput) => {
    const result = await mutate({
      variables: {
        input: {
          coreWorkflowIdToDuplicate: input.workflowIdToDuplicate,
          coreWorkflowVersionIdToCopy: input.workflowVersionIdToCopy,
        },
      },
    });

    await invalidateCoreWorkflowVersions(apolloCoreClient);

    return result.data
      ? { workflowId: result.data.duplicateWorkflow.id }
      : undefined;
  };

  return {
    duplicateWorkflow,
  };
};
