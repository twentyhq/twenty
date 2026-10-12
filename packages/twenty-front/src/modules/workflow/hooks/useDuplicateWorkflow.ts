import { invalidateCoreWorkflowVersions } from '@/object-core/workflows/versions/utils/invalidateCoreWorkflowVersions';
import { DuplicateCoreWorkflowDocument } from '~/generated/graphql';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useMutation } from '@apollo/client/react';

export const useDuplicateWorkflow = () => {
  const apolloCoreClient = useApolloCoreClient();
  const [mutateCore] = useMutation(DuplicateCoreWorkflowDocument, {
    client: apolloCoreClient,
  });

  const duplicateWorkflow = async (input: {
    workflowIdToDuplicate: string;
    workflowVersionIdToCopy: string;
  }) => {
    const result = await mutateCore({
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
