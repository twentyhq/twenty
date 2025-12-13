import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useGetUpdatableWorkflowVersionOrThrow } from '@/workflow/hooks/useGetUpdatableWorkflowVersionOrThrow';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { workflowVisualizerWorkflowIdComponentState } from '@/workflow/states/workflowVisualizerWorkflowIdComponentState';
import { useDeleteWorkflowVersionStep } from '@/workflow/workflow-steps/hooks/useDeleteWorkflowVersionStep';
import { useResetWorkflowAiAgentPermissionsStateOnCommandMenuClose } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/hooks/useResetWorkflowAiAgentPermissionsStateOnCommandMenuClose';
import { useStepsOutputSchema } from '@/workflow/workflow-variables/hooks/useStepsOutputSchema';
import { isDefined } from 'twenty-shared/utils';

export const useDeleteStep = () => {
  const { resetPermissionState } =
    useResetWorkflowAiAgentPermissionsStateOnCommandMenuClose();
  const { deleteWorkflowVersionStep } = useDeleteWorkflowVersionStep();
  const { deleteStepsOutputSchema } = useStepsOutputSchema();

  const { getUpdatableWorkflowVersion } =
    useGetUpdatableWorkflowVersionOrThrow();
  const { closeCommandMenu } = useCommandMenu();
  const workflowVisualizerWorkflowId = useRecoilComponentValue(
    workflowVisualizerWorkflowIdComponentState,
  );
  const workflow = useWorkflowWithCurrentVersion(workflowVisualizerWorkflowId);

  const deleteStep = async (stepId: string) => {
    const workflowVersionId = await getUpdatableWorkflowVersion();

    const isAiAgentStep =
      isDefined(workflow?.currentVersion?.steps) &&
      workflow.currentVersion.steps.some(
        (step) => step.id === stepId && step.type === 'AI_AGENT',
      );

    await deleteWorkflowVersionStep({
      workflowVersionId,
      stepId,
    });

    closeCommandMenu();

    deleteStepsOutputSchema({
      stepIds: [stepId],
      workflowVersionId,
    });

    if (isAiAgentStep) {
      resetPermissionState();
    }
  };

  return {
    deleteStep,
  };
};
