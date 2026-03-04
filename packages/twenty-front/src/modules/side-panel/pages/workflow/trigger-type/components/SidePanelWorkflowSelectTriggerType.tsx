import { useSidePanelWorkflowIdOrThrow } from '@/command-menu/pages/workflow/hooks/useSidePanelWorkflowIdOrThrow';
import { SidePanelWorkflowSelectTriggerTypeContent } from '@/command-menu/pages/workflow/trigger-type/components/SidePanelWorkflowSelectTriggerTypeContent';
import { getWorkflowVisualizerComponentInstanceId } from '@/workflow/utils/getWorkflowVisualizerComponentInstanceId';
import { WorkflowVisualizerComponentInstanceContext } from '@/workflow/workflow-diagram/states/contexts/WorkflowVisualizerComponentInstanceContext';

export const CommandMenuWorkflowSelectTriggerType = () => {
  const workflowId = useSidePanelWorkflowIdOrThrow();

  return (
    <WorkflowVisualizerComponentInstanceContext.Provider
      value={{
        instanceId: getWorkflowVisualizerComponentInstanceId({
          recordId: workflowId,
        }),
      }}
    >
      <SidePanelWorkflowSelectTriggerTypeContent />
    </WorkflowVisualizerComponentInstanceContext.Provider>
  );
};
