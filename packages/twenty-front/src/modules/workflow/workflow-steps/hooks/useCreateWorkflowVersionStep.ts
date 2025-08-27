import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { CREATE_WORKFLOW_VERSION_STEP } from '@/workflow/graphql/mutations/createWorkflowVersionStep';
import { useMutation } from '@apollo/client';
import {
  type CreateWorkflowVersionStepInput,
  type CreateWorkflowVersionStepMutation,
  type CreateWorkflowVersionStepMutationVariables,
} from '~/generated-metadata/graphql';
import { useUpdateWorkflowVersionCache } from '@/workflow/workflow-steps/hooks/useUpdateWorkflowVersionCache';
import { flowComponentState } from '@/workflow/states/flowComponentState';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { isDefined } from 'twenty-shared/utils';

export const useCreateWorkflowVersionStep = () => {
  const apolloCoreClient = useApolloCoreClient();

  const { updateWorkflowVersionCache } = useUpdateWorkflowVersionCache();

  const setFlow = useSetRecoilComponentState(flowComponentState);

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
    });

    const workflowVersionStepChanges = result?.data?.createWorkflowVersionStep;

    const updatedWorkflowVersion = updateWorkflowVersionCache({
      workflowVersionStepChanges,
      workflowVersionId: input.workflowVersionId,
    });

    if (isDefined(updatedWorkflowVersion)) {
      setFlow({
        workflowVersionId: updatedWorkflowVersion.id,
        trigger: updatedWorkflowVersion.trigger,
        steps: updatedWorkflowVersion.steps,
      });
    }

    return result;
  };

  return { createWorkflowVersionStep };
};
