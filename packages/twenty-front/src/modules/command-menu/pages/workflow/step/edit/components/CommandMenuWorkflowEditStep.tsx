import { ActionMenuContext } from '@/action-menu/contexts/ActionMenuContext';
import { workflowIdComponentState } from '@/command-menu/pages/workflow/states/workflowIdComponentState';
import { CommandMenuWorkflowEditStepContent } from '@/command-menu/pages/workflow/step/edit/components/CommandMenuWorkflowEditStepContent';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { WorkflowStepContextProvider } from '@/workflow/states/context/WorkflowStepContext';
import { getWorkflowVisualizerComponentInstanceId } from '@/workflow/utils/getWorkflowVisualizerComponentInstanceId';
import { WorkflowVisualizerComponentInstanceContext } from '@/workflow/workflow-diagram/states/contexts/WorkflowVisualizerComponentInstanceContext';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const CommandMenuWorkflowEditStep = () => {
  const workflowId = useRecoilComponentValueV2(workflowIdComponentState);
  if (!isDefined(workflowId)) {
    throw new Error('Expected workflowIdComponentState to be defined');
  }

  const { isInRightDrawer } = useContext(ActionMenuContext);

  console.log({ isInRightDrawer });

  return (
    <WorkflowVisualizerComponentInstanceContext.Provider
      value={{
        instanceId: getWorkflowVisualizerComponentInstanceId({
          id: workflowId,
          isInRightDrawer,
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

  return (
    <WorkflowStepContextProvider
      value={{ workflowVersionId: workflow.currentVersion.id }}
    >
      <CommandMenuWorkflowEditStepContent workflow={workflow} />
    </WorkflowStepContextProvider>
  );
};
