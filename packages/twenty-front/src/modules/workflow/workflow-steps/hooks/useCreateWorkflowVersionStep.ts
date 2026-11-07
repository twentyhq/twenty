import { useWorkflowEditorMutationErrorHandler } from '@/workflow/hooks/useWorkflowEditorMutationErrorHandler';
import { useSavePendingWorkflowFlow } from '@/workflow/hooks/useSavePendingWorkflowFlow';
import { invalidateCoreWorkflowVersions } from '@/object-core/workflows/versions/utils/invalidateCoreWorkflowVersions';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useApplyWorkflowVersionStepChanges } from '@/workflow/workflow-steps/hooks/useApplyWorkflowVersionStepChanges';
import { useMutation } from '@apollo/client/react';
import {
  CreateCoreWorkflowVersionStepDocument,
  type CreateCoreWorkflowVersionStepInput,
} from '~/generated/graphql';

export type CreateWorkflowVersionStepInput = Omit<
  CreateCoreWorkflowVersionStepInput,
  'coreWorkflowVersionId'
> & {
  workflowVersionId: string;
};

export const useCreateWorkflowVersionStep = () => {
  const { savePendingWorkflowFlow } = useSavePendingWorkflowFlow();
  const apolloCoreClient = useApolloCoreClient();
  const handleCoreMutationError = useWorkflowEditorMutationErrorHandler();
  const [mutateCore] = useMutation(CreateCoreWorkflowVersionStepDocument, {
    client: apolloCoreClient,
    onError: handleCoreMutationError,
  });

  const { applyWorkflowVersionStepChanges } =
    useApplyWorkflowVersionStepChanges();

  const createWorkflowVersionStep = async (
    input: CreateWorkflowVersionStepInput,
  ) => {
    const { workflowVersionId, ...stepInput } = input;
    await savePendingWorkflowFlow();

    const result = await mutateCore({
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
