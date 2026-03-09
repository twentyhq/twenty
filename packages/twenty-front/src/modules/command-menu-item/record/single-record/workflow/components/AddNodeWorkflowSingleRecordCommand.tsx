import { Command } from '@/command-menu-item/display/components/Command';
import { useSelectedRecordIdOrThrow } from '@/command-menu-item/record/single-record/hooks/useSelectedRecordIdOrThrow';
import { useSidePanelWorkflowNavigation } from '@/side-panel/pages/workflow/hooks/useSidePanelWorkflowNavigation';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { isDefined } from 'twenty-shared/utils';

export const AddNodeWorkflowSingleRecordCommand = () => {
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

  return <Command onClick={onClick} />;
};
