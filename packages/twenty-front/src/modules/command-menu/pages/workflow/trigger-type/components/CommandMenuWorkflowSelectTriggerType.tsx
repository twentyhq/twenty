import { workflowIdComponentState } from '@/command-menu/pages/workflow/states/workflowIdComponentState';
import { CommandMenuWorkflowSelectTriggerTypeContent } from '@/command-menu/pages/workflow/trigger-type/components/CommandMenuWorkflowSelectTriggerTypeContent';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { getWorkflowVisualizerComponentInstanceId } from '@/workflow/utils/getWorkflowVisualizerComponentInstanceId';
import { WorkflowVisualizerComponentInstanceContext } from '@/workflow/workflow-diagram/states/contexts/WorkflowVisualizerComponentInstanceContext';
import { isDefined } from 'twenty-shared/utils';

export const CommandMenuWorkflowSelectTriggerType = () => {
  const workflowId = useRecoilComponentValueV2(workflowIdComponentState);
  if (!isDefined(workflowId)) {
    throw new Error('Expected workflowIdComponentState to be defined');
  }

  const workflow = useWorkflowWithCurrentVersion(workflowId);

  if (!isDefined(workflow)) {
    return null;
  }

  return (
    <WorkflowVisualizerComponentInstanceContext.Provider
      value={{
        instanceId: getWorkflowVisualizerComponentInstanceId({
          recordId: workflowId,
        }),
      }}
    >
      <CommandMenuWorkflowSelectTriggerTypeContent workflow={workflow} />
    </WorkflowVisualizerComponentInstanceContext.Provider>
  );
};
