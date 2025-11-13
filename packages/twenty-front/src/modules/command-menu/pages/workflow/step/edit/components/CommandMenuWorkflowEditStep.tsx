import { useCommandMenuWorkflowIdOrThrow } from '@/command-menu/pages/workflow/hooks/useCommandMenuWorkflowIdOrThrow';
import { CommandMenuWorkflowEditStepContent } from '@/command-menu/pages/workflow/step/edit/components/CommandMenuWorkflowEditStepContent';
import { getWorkflowVisualizerComponentInstanceId } from '@/workflow/utils/getWorkflowVisualizerComponentInstanceId';
import { WorkflowVisualizerComponentInstanceContext } from '@/workflow/workflow-diagram/states/contexts/WorkflowVisualizerComponentInstanceContext';

export const CommandMenuWorkflowEditStep = () => {
  const workflowId = useCommandMenuWorkflowIdOrThrow();
  const instanceId = getWorkflowVisualizerComponentInstanceId({
    recordId: workflowId,
  });

  return (
    <WorkflowVisualizerComponentInstanceContext.Provider
      value={{
        instanceId,
      }}
    >
      <CommandMenuWorkflowEditStepContent />
    </WorkflowVisualizerComponentInstanceContext.Provider>
  );
};
