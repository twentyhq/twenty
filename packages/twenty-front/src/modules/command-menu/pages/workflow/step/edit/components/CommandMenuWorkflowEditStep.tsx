import { workflowIdComponentState } from '@/command-menu/pages/workflow/states/workflowIdComponentState';
import { CommandMenuWorkflowEditStepContent } from '@/command-menu/pages/workflow/step/edit/components/CommandMenuWorkflowEditStepContent';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { WorkflowStepContextProvider } from '@/workflow/states/context/WorkflowStepContext';
import { isDefined } from 'twenty-shared';

export const CommandMenuWorkflowEditStep = () => {
  const workflowId = useRecoilComponentValueV2(workflowIdComponentState);
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
