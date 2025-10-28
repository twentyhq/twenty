import { useCommandMenuWorkflowIdOrThrow } from '@/command-menu/pages/workflow/hooks/useCommandMenuWorkflowIdOrThrow';
import { CommandMenuWorkflowSelectTriggerTypeContent } from '@/command-menu/pages/workflow/trigger-type/components/CommandMenuWorkflowSelectTriggerTypeContent';
import { getWorkflowVisualizerComponentInstanceId } from '@/workflow/utils/getWorkflowVisualizerComponentInstanceId';
import { WorkflowVisualizerComponentInstanceContext } from '@/workflow/workflow-diagram/states/contexts/WorkflowVisualizerComponentInstanceContext';

export const CommandMenuWorkflowSelectTriggerType = () => {
  const workflowId = useCommandMenuWorkflowIdOrThrow();

  return (
    <WorkflowVisualizerComponentInstanceContext.Provider
      value={{
        instanceId: getWorkflowVisualizerComponentInstanceId({
          recordId: workflowId,
        }),
      }}
    >
      <CommandMenuWorkflowSelectTriggerTypeContent />
    </WorkflowVisualizerComponentInstanceContext.Provider>
  );
};
