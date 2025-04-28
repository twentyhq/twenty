import { CommandMenuWorkflowRunViewStepContent } from '@/command-menu/pages/workflow/step/view-run/components/CommandMenuWorkflowRunViewStepContent';
import { useCommandMenuWorkflowRunIdOrThrow } from '@/command-menu/pages/workflow/step/view-run/hooks/useCommandMenuWorkflowRunIdOrThrow';
import { getWorkflowVisualizerComponentInstanceId } from '@/workflow/utils/getWorkflowVisualizerComponentInstanceId';
import { WorkflowVisualizerComponentInstanceContext } from '@/workflow/workflow-diagram/states/contexts/WorkflowVisualizerComponentInstanceContext';

export const CommandMenuWorkflowRunViewStep = () => {
  const workflowRunId = useCommandMenuWorkflowRunIdOrThrow();

  return (
    <WorkflowVisualizerComponentInstanceContext.Provider
      value={{
        instanceId: getWorkflowVisualizerComponentInstanceId({
          recordId: workflowRunId,
        }),
      }}
    >
      <CommandMenuWorkflowRunViewStepContent />
    </WorkflowVisualizerComponentInstanceContext.Provider>
  );
};
