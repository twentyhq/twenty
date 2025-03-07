import { CommandMenuWorkflowSelectActionContent } from '@/command-menu/pages/workflow/action/components/CommandMenuWorkflowSelectActionContent';
import { workflowIdComponentState } from '@/command-menu/pages/workflow/states/workflowIdComponentState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { isDefined } from 'twenty-shared';

export const CommandMenuWorkflowSelectAction = () => {
  const workflowId = useRecoilComponentValueV2(workflowIdComponentState);
  const workflow = useWorkflowWithCurrentVersion(workflowId);

  if (!isDefined(workflow)) {
    return null;
  }

  return <CommandMenuWorkflowSelectActionContent workflow={workflow} />;
};
