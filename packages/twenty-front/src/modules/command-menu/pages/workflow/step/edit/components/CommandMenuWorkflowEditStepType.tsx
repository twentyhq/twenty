import { useCommandMenuWorkflowIdOrThrow } from '@/command-menu/pages/workflow/hooks/useCommandMenuWorkflowIdOrThrow';
import { CommandMenuWorkflowEditStepTypeContent } from '@/command-menu/pages/workflow/step/edit/components/CommandMenuWorkflowEditStepTypeContent';
import { getWorkflowVisualizerComponentInstanceId } from '@/workflow/utils/getWorkflowVisualizerComponentInstanceId';
import { WorkflowVisualizerComponentInstanceContext } from '@/workflow/workflow-diagram/states/contexts/WorkflowVisualizerComponentInstanceContext';

export const CommandMenuWorkflowEditStepType = () => {
  const workflowId = useCommandMenuWorkflowIdOrThrow();

  return (
    <WorkflowVisualizerComponentInstanceContext.Provider
      value={{
        instanceId: getWorkflowVisualizerComponentInstanceId({
          recordId: workflowId,
        }),
      }}
    >
      <CommandMenuWorkflowEditStepTypeContent />
    </WorkflowVisualizerComponentInstanceContext.Provider>
  );
};
