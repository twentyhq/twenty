import { CommandMenuWorkflowSelectActionContent } from '@/command-menu/pages/workflow/action/components/CommandMenuWorkflowSelectActionContent';
import { workflowIdComponentState } from '@/command-menu/pages/workflow/states/workflowIdComponentState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { getWorkflowVisualizerComponentInstanceId } from '@/workflow/utils/getWorkflowVisualizerComponentInstanceId';
import { WorkflowVisualizerComponentInstanceContext } from '@/workflow/workflow-diagram/states/contexts/WorkflowVisualizerComponentInstanceContext';
import { isDefined } from 'twenty-shared/utils';

export const CommandMenuWorkflowSelectAction = () => {
  const workflowId = useRecoilComponentValueV2(workflowIdComponentState);
  console.log('workflowId in CommandMenuWorkflowSelectAction', workflowId);
  if (!isDefined(workflowId)) {
    throw new Error('Expected workflowIdComponentState to be defined');
  }

  return (
    <WorkflowVisualizerComponentInstanceContext.Provider
      value={{
        instanceId: getWorkflowVisualizerComponentInstanceId({
          recordId: workflowId,
        }),
      }}
    >
      <Child workflowId={workflowId} />
    </WorkflowVisualizerComponentInstanceContext.Provider>
  );
};

const Child = ({ workflowId }: { workflowId: string }) => {
  const workflow = useWorkflowWithCurrentVersion(workflowId);

  if (!isDefined(workflow)) {
    return null;
  }

  return <CommandMenuWorkflowSelectActionContent workflow={workflow} />;
};
