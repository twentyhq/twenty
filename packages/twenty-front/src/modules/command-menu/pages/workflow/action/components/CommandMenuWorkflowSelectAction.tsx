import { CommandMenuWorkflowSelectActionContent } from '@/command-menu/pages/workflow/action/components/CommandMenuWorkflowSelectActionContent';
import { useCommandMenuWorkflowIdOrThrow } from '@/command-menu/pages/workflow/hooks/useCommandMenuWorkflowIdOrThrow';
import { getWorkflowVisualizerComponentInstanceId } from '@/workflow/utils/getWorkflowVisualizerComponentInstanceId';
import { WorkflowVisualizerComponentInstanceContext } from '@/workflow/workflow-diagram/states/contexts/WorkflowVisualizerComponentInstanceContext';

export const CommandMenuWorkflowSelectAction = () => {
  const workflowId = useCommandMenuWorkflowIdOrThrow();

  return (
    <WorkflowVisualizerComponentInstanceContext.Provider
      value={{
        instanceId: getWorkflowVisualizerComponentInstanceId({
          recordId: workflowId,
        }),
      }}
    >
      <CommandMenuWorkflowSelectActionContent />
    </WorkflowVisualizerComponentInstanceContext.Provider>
  );
};
