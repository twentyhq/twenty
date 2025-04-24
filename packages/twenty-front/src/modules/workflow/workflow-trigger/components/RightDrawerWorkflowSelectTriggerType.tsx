import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { workflowVisualizerWorkflowIdComponentState } from '@/workflow/states/workflowVisualizerWorkflowIdComponentState';
import { RightDrawerWorkflowSelectTriggerTypeContent } from '@/workflow/workflow-trigger/components/RightDrawerWorkflowSelectTriggerTypeContent';
import { isDefined } from 'twenty-shared/utils';

export const RightDrawerWorkflowSelectTriggerType = () => {
  // TODO: check; might break as I'm unsure if the context is provided here
  const workflowVisualizerWorkflowId = useRecoilComponentValueV2(
    workflowVisualizerWorkflowIdComponentState,
  );
  const workflow = useWorkflowWithCurrentVersion(workflowVisualizerWorkflowId);

  if (!isDefined(workflow)) {
    return null;
  }

  return <RightDrawerWorkflowSelectTriggerTypeContent workflow={workflow} />;
};
