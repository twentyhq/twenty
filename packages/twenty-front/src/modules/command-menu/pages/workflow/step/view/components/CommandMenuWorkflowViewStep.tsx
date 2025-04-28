import { useCommandMenuWorkflowVersionIdOrThrow } from '@/command-menu/pages/workflow/step/edit/hooks/useCommandMenuWorkflowVersionIdOrThrow';
import { CommandMenuWorkflowViewStepContent } from '@/command-menu/pages/workflow/step/view/components/CommandMenuWorkflowViewStepContent';
import { getWorkflowVisualizerComponentInstanceId } from '@/workflow/utils/getWorkflowVisualizerComponentInstanceId';
import { WorkflowVisualizerComponentInstanceContext } from '@/workflow/workflow-diagram/states/contexts/WorkflowVisualizerComponentInstanceContext';

export const CommandMenuWorkflowViewStep = () => {
  const workflowVersionId = useCommandMenuWorkflowVersionIdOrThrow();

  return (
    <WorkflowVisualizerComponentInstanceContext.Provider
      value={{
        instanceId: getWorkflowVisualizerComponentInstanceId({
          recordId: workflowVersionId,
        }),
      }}
    >
      <CommandMenuWorkflowViewStepContent />
    </WorkflowVisualizerComponentInstanceContext.Provider>
  );
};
