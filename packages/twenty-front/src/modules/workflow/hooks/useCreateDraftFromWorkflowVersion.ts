import { useMutation } from '@apollo/client/react';

import { invalidateCoreWorkflowVersions } from '@/object-core/workflows/versions/utils/invalidateCoreWorkflowVersions';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { CreateDraftFromCoreWorkflowVersionDocument } from '~/generated/graphql';

export type CreateDraftFromWorkflowVersionInput = {
  workflowId: string;
  workflowVersionIdToCopy: string;
};

export const useCreateDraftFromWorkflowVersion = () => {
  const apolloCoreClient = useApolloCoreClient();
  const [mutate] = useMutation(CreateDraftFromCoreWorkflowVersionDocument, {
    client: apolloCoreClient,
  });

  const createDraftFromWorkflowVersion = async (
    input: CreateDraftFromWorkflowVersionInput,
  ) => {
    const result = await mutate({
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
