import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useGetUpdatableWorkflowVersionOrThrow } from '@/workflow/hooks/useGetUpdatableWorkflowVersionOrThrow';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { workflowVisualizerWorkflowIdComponentState } from '@/workflow/states/workflowVisualizerWorkflowIdComponentState';
import { type WorkflowIfElseAction } from '@/workflow/types/Workflow';
import { useDeleteWorkflowVersionStep } from '@/workflow/workflow-steps/hooks/useDeleteWorkflowVersionStep';
import { useResetWorkflowAiAgentPermissionsStateOnCommandMenuClose } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/hooks/useResetWorkflowAiAgentPermissionsStateOnCommandMenuClose';
import { getEmptyChildStepIds } from '@/workflow/workflow-steps/workflow-actions/if-else-action/utils/getEmptyChildStepIds';
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

    const steps = workflow?.currentVersion?.steps;
    const stepToDelete = isDefined(steps)
      ? steps.find((step) => step.id === stepId)
      : undefined;

    if (
      isDefined(stepToDelete) &&
      isDefined(steps) &&
      stepToDelete.type === 'IF_ELSE'
    ) {
      const emptyChildStepIds = getEmptyChildStepIds({
        ifElseAction: stepToDelete as WorkflowIfElseAction,
        allSteps: steps,
      });

      for (const emptyChildStepId of emptyChildStepIds) {
        await deleteWorkflowVersionStep({
          workflowVersionId,
          stepId: emptyChildStepId,
        });
      }

      if (emptyChildStepIds.length > 0) {
        deleteStepsOutputSchema({
          stepIds: emptyChildStepIds,
          workflowVersionId,
        });
      }
    }

    await deleteWorkflowVersionStep({
      workflowVersionId,
      stepId,
    });

    closeCommandMenu();

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
