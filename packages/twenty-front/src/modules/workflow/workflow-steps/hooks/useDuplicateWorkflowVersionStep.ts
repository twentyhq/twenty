import { useErrorToast } from '@/error-handler/hooks/useErrorToast';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { DUPLICATE_WORKFLOW_VERSION_STEP } from '@/workflow/graphql/mutations/duplicateWorkflowVersionStep';
import { useApplyWorkflowVersionStepChanges } from '@/workflow/workflow-steps/hooks/useApplyWorkflowVersionStepChanges';
import { useMutation } from '@apollo/client/react';
import {
  type DuplicateWorkflowVersionStepInput,
  type DuplicateWorkflowVersionStepMutation,
  type DuplicateWorkflowVersionStepMutationVariables,
} from '~/generated/graphql';

export const useDuplicateWorkflowVersionStep = () => {
  const apolloCoreClient = useApolloCoreClient();

  const { applyWorkflowVersionStepChanges } =
    useApplyWorkflowVersionStepChanges();

  const { addErrorToast } = useErrorToast();

  const [mutate] = useMutation<
    DuplicateWorkflowVersionStepMutation,
    DuplicateWorkflowVersionStepMutationVariables
  >(DUPLICATE_WORKFLOW_VERSION_STEP, {
    client: apolloCoreClient,
  });

  const duplicateWorkflowVersionStep = async (
    input: DuplicateWorkflowVersionStepInput,
  ) => {
    const result = await mutate({
      variables: { input },
      onError: (error) => {
        addErrorToast(error);
      },
    });

    const workflowVersionStepChanges =
      result?.data?.duplicateWorkflowVersionStep;

    applyWorkflowVersionStepChanges({
      workflowVersionStepChanges,
      workflowVersionId: input.workflowVersionId,
    });

    return result;
  };

  return { duplicateWorkflowVersionStep };
};
