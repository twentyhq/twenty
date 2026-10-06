import { useMutation } from '@apollo/client/react';

import { invalidateCoreWorkflowVersions } from '@/object-core/workflows/versions/utils/invalidateCoreWorkflowVersions';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useWorkflowEditorMutationErrorHandler } from '@/workflow/hooks/useWorkflowEditorMutationErrorHandler';
import { useApplyWorkflowVersionStepChanges } from '@/workflow/workflow-steps/hooks/useApplyWorkflowVersionStepChanges';
import {
  CreateCoreWorkflowVersionStepDocument,
  type CreateCoreWorkflowVersionStepInput,
} from '~/generated/graphql';

type CreateWorkflowVersionStepInput = Omit<
  CreateCoreWorkflowVersionStepInput,
  'coreWorkflowVersionId'
> & {
  workflowVersionId: string;
};

export const useCreateWorkflowVersionStep = () => {
  const apolloCoreClient = useApolloCoreClient();
  const handleMutationError = useWorkflowEditorMutationErrorHandler();
  const [mutate] = useMutation(CreateCoreWorkflowVersionStepDocument, {
    client: apolloCoreClient,
    onError: handleMutationError,
  });

  const { applyWorkflowVersionStepChanges } =
    useApplyWorkflowVersionStepChanges();

  const createWorkflowVersionStep = async (
    input: CreateWorkflowVersionStepInput,
  ) => {
    const { workflowVersionId, ...stepInput } = input;
    const result = await mutate({
      variables: {
        input: { ...stepInput, coreWorkflowVersionId: workflowVersionId },
      },
    });

    const workflowVersionStepChanges = result?.data?.createWorkflowVersionStep;

    applyWorkflowVersionStepChanges({
      workflowVersionStepChanges,
      workflowVersionId,
    });

    await invalidateCoreWorkflowVersions(apolloCoreClient);

    return result;
  };

  return { createWorkflowVersionStep };
};
