import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useGetUpdatableWorkflowVersionOrThrow } from '@/workflow/hooks/useGetUpdatableWorkflowVersionOrThrow';
import { flowComponentState } from '@/workflow/states/flowComponentState';
import { useDeleteWorkflowVersionStep } from '@/workflow/workflow-steps/hooks/useDeleteWorkflowVersionStep';
import { useResetWorkflowAiAgentPermissionsStateOnSidePanelClose } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/hooks/useResetWorkflowAiAgentPermissionsStateOnSidePanelClose';
import { useStepsOutputSchema } from '@/workflow/workflow-variables/hooks/useStepsOutputSchema';
import { isDefined } from 'twenty-shared/utils';

export const useDeleteStep = () => {
  const { resetPermissionState } =
    useResetWorkflowAiAgentPermissionsStateOnSidePanelClose();
  const { deleteWorkflowVersionStep } = useDeleteWorkflowVersionStep();
  const { deleteStepsOutputSchema } = useStepsOutputSchema();

  const { getUpdatableWorkflowVersion } =
    useGetUpdatableWorkflowVersionOrThrow();
  const { closeSidePanelMenu } = useSidePanelMenu();
  const flow = useAtomComponentStateValue(flowComponentState);

  const deleteStep = async (stepId: string) => {
    const workflowVersionId = await getUpdatableWorkflowVersion();

    const steps = flow?.steps;
    const stepToDelete = isDefined(steps)
      ? steps.find((step) => step.id === stepId)
      : undefined;

    await deleteWorkflowVersionStep({
      workflowVersionId,
      stepId,
    });

    closeSidePanelMenu();

    deleteStepsOutputSchema({
      stepIds: [stepId],
      workflowVersionId,
    });

    if (isDefined(stepToDelete) && stepToDelete.type === 'AI_AGENT') {
      resetPermissionState();
    }
  };

  return {
    deleteStep,
  };
};
