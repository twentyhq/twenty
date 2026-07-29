import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { CREATE_WORKFLOW_VERSION_STEP } from '@/workflow/graphql/mutations/createWorkflowVersionStep';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useMutation } from '@apollo/client/react';
import {
  type CreateWorkflowVersionStepInput,
  type CreateWorkflowVersionStepMutation,
  type CreateWorkflowVersionStepMutationVariables,
} from '~/generated/graphql';
import { useApplyWorkflowVersionStepChanges } from '@/workflow/workflow-steps/hooks/useApplyWorkflowVersionStepChanges';

export const useCreateWorkflowVersionStep = () => {
  const apolloCoreClient = useApolloCoreClient();

  const { applyWorkflowVersionStepChanges } = useApplyWorkflowVersionStepChanges();

  const { enqueueErrorSnackBar } = useSnackBar();

  const [mutate] = useMutation<
    CreateWorkflowVersionStepMutation,
    CreateWorkflowVersionStepMutationVariables
  >(CREATE_WORKFLOW_VERSION_STEP, {
    client: apolloCoreClient,
  });

  const createWorkflowVersionStep = async (
    input: CreateWorkflowVersionStepInput,
  ) => {
    const result = await mutate({
      variables: { input },
      onError: (error) => {
        enqueueErrorSnackBar({ apolloError: error });
      },
    });

    const workflowVersionStepChanges = result?.data?.createWorkflowVersionStep;

    applyWorkflowVersionStepChanges({
      workflowVersionStepChanges,
      workflowVersionId: input.workflowVersionId,
    });

    return result;
  };

  return { createWorkflowVersionStep };
};
