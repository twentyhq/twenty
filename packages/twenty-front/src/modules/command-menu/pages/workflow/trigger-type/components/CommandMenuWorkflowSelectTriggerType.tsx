import { workflowIdComponentState } from '@/command-menu/pages/workflow/states/workflowIdComponentState';
import { CommandMenuWorkflowSelectTriggerTypeContent } from '@/command-menu/pages/workflow/trigger-type/components/CommandMenuWorkflowSelectTriggerTypeContent';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { isDefined } from 'twenty-shared';

export const CommandMenuWorkflowSelectTriggerType = () => {
  const workflowId = useRecoilComponentValueV2(workflowIdComponentState);
  const workflow = useWorkflowWithCurrentVersion(workflowId);

  if (!isDefined(workflow)) {
    return null;
  }

  return <CommandMenuWorkflowSelectTriggerTypeContent workflow={workflow} />;
};
