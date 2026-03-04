import { SidePanelWorkflowRunViewStepContent } from '@/command-menu/pages/workflow/step/view-run/components/SidePanelWorkflowRunViewStepContent';
import { useSidePanelWorkflowRunIdOrThrow } from '@/command-menu/pages/workflow/step/view-run/hooks/useSidePanelWorkflowRunIdOrThrow';
import { getWorkflowVisualizerComponentInstanceId } from '@/workflow/utils/getWorkflowVisualizerComponentInstanceId';
import { WorkflowVisualizerComponentInstanceContext } from '@/workflow/workflow-diagram/states/contexts/WorkflowVisualizerComponentInstanceContext';

export const CommandMenuWorkflowRunViewStep = () => {
  const workflowRunId = useSidePanelWorkflowRunIdOrThrow();
  return (
    <WorkflowVisualizerComponentInstanceContext.Provider
      value={{
        instanceId: getWorkflowVisualizerComponentInstanceId({
          recordId: workflowRunId,
        }),
      }}
    >
      <SidePanelWorkflowRunViewStepContent />
    </WorkflowVisualizerComponentInstanceContext.Provider>
  );
};
