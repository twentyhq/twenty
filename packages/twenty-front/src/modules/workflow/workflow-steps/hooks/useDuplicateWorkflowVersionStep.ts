import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/jotai/hooks/useSetRecoilComponentStateV2';
import { DUPLICATE_WORKFLOW_VERSION_STEP } from '@/workflow/graphql/mutations/duplicateWorkflowVersionStep';
import { flowComponentState } from '@/workflow/states/flowComponentState';
import { useUpdateWorkflowVersionCache } from '@/workflow/workflow-steps/hooks/useUpdateWorkflowVersionCache';
import { useMutation } from '@apollo/client';
import { isDefined } from 'twenty-shared/utils';
import {
  type DuplicateWorkflowVersionStepInput,
  type DuplicateWorkflowVersionStepMutation,
  type DuplicateWorkflowVersionStepMutationVariables,
} from '~/generated/graphql';

export const useDuplicateWorkflowVersionStep = () => {
  const apolloCoreClient = useApolloCoreClient();

  const { updateWorkflowVersionCache } = useUpdateWorkflowVersionCache();

  const setFlow = useSetRecoilComponentStateV2(flowComponentState);

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
    });

    const workflowVersionStepChanges =
      result?.data?.duplicateWorkflowVersionStep;

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

  return { duplicateWorkflowVersionStep };
};
