import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useMountedEngineCommandContext } from '@/command-menu-item/engine-command/hooks/useMountedEngineCommandContext';
import { useSidePanelWorkflowNavigation } from '@/side-panel/pages/workflow/hooks/useSidePanelWorkflowNavigation';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { isDefined } from 'twenty-shared/utils';

export const AddNodeWorkflowSingleRecordCommand = () => {
  const { selectedRecords } = useMountedEngineCommandContext();

  const recordId = selectedRecords[0]?.id;
  const workflowWithCurrentVersion = useWorkflowWithCurrentVersion(
    recordId ?? '',
  );
  const { openWorkflowCreateStepInSidePanel } =
    useSidePanelWorkflowNavigation();

  if (!isDefined(recordId)) {
    throw new Error('Record ID is required to add node workflow');
  }

  const handleExecute = () => {
    if (!isDefined(workflowWithCurrentVersion)) {
      return;
    }

    openWorkflowCreateStepInSidePanel(workflowWithCurrentVersion.id);
  };

  return <HeadlessEngineCommandWrapperEffect execute={handleExecute} />;
};
