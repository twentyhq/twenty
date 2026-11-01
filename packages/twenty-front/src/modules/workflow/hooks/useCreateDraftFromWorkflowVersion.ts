import { CreateDraftFromCoreWorkflowVersionDocument } from '~/generated/graphql';
import { invalidateCoreWorkflowVersions } from '@/object-core/workflows/versions/utils/invalidateCoreWorkflowVersions';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useMutation } from '@apollo/client/react';

export const useCreateDraftFromWorkflowVersion = () => {
  const apolloCoreClient = useApolloCoreClient();
  const [mutateCore] = useMutation(CreateDraftFromCoreWorkflowVersionDocument, {
    client: apolloCoreClient,
  });

  const createDraftFromWorkflowVersion = async (input: {
    workflowId: string;
    workflowVersionIdToCopy: string;
  }) => {
    const result = await mutateCore({
      variables: {
        input: {
          coreWorkflowId: input.workflowId,
          coreWorkflowVersionIdToCopy: input.workflowVersionIdToCopy,
        },
      },
    });
    await invalidateCoreWorkflowVersions(apolloCoreClient);

    return result.data?.createDraftFromWorkflowVersion.id;
  };

  return {
    createDraftFromWorkflowVersion,
  };
};
