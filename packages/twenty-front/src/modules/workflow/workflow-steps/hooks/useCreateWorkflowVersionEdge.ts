import { useMutation } from '@apollo/client/react';

import { invalidateCoreWorkflowVersions } from '@/object-core/workflows/versions/utils/invalidateCoreWorkflowVersions';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useWorkflowEditorMutationErrorHandler } from '@/workflow/hooks/useWorkflowEditorMutationErrorHandler';
import { useApplyWorkflowVersionStepChanges } from '@/workflow/workflow-steps/hooks/useApplyWorkflowVersionStepChanges';
import {
  CreateCoreWorkflowVersionEdgeDocument,
  type CreateCoreWorkflowVersionEdgeInput,
} from '~/generated/graphql';

type CreateWorkflowVersionEdgeInput = Omit<
  CreateCoreWorkflowVersionEdgeInput,
  'coreWorkflowVersionId'
> & {
  workflowVersionId: string;
};

export const useCreateWorkflowVersionEdge = () => {
  const apolloCoreClient = useApolloCoreClient();
  const handleMutationError = useWorkflowEditorMutationErrorHandler();
  const [mutate] = useMutation(CreateCoreWorkflowVersionEdgeDocument, {
    client: apolloCoreClient,
    onError: handleMutationError,
  });

  const { applyWorkflowVersionStepChanges } =
    useApplyWorkflowVersionStepChanges();

  const createWorkflowVersionEdge = async (
    input: CreateWorkflowVersionEdgeInput,
  ) => {
    const { workflowVersionId, ...stepInput } = input;
    const result = await mutate({
      variables: {
        input: { ...stepInput, coreWorkflowVersionId: workflowVersionId },
      },
    });

    const workflowVersionStepChanges = result?.data?.createWorkflowVersionEdge;

    applyWorkflowVersionStepChanges({
      workflowVersionStepChanges,
      workflowVersionId,
    });

    await invalidateCoreWorkflowVersions(apolloCoreClient);

    return result;
  };

  return { createWorkflowVersionEdge };
};
