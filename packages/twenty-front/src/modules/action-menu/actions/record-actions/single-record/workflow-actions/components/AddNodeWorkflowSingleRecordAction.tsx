import { Action } from '@/action-menu/actions/components/Action';
import { useSelectedRecordIdOrThrow } from '@/action-menu/actions/record-actions/single-record/hooks/useSelectedRecordIdOrThrow';
import { useSidePanelWorkflowNavigation } from '@/side-panel/pages/workflow/hooks/useSidePanelWorkflowNavigation';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { isDefined } from 'twenty-shared/utils';

export const AddNodeWorkflowSingleRecordAction = () => {
  const recordId = useSelectedRecordIdOrThrow();
  const workflowWithCurrentVersion = useWorkflowWithCurrentVersion(recordId);
  const { openWorkflowCreateStepInSidePanel } =
    useSidePanelWorkflowNavigation();

  const onClick = () => {
    if (!isDefined(workflowWithCurrentVersion)) {
      return;
    }

    openWorkflowCreateStepInSidePanel(workflowWithCurrentVersion.id);
  };

  return <Action onClick={onClick} />;
};
