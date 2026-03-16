import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useEngineCommandExecutionContext } from '@/command-menu-item/engine-command/hooks/useEngineCommandExecutionContext';
import { useSidePanelWorkflowNavigation } from '@/side-panel/pages/workflow/hooks/useSidePanelWorkflowNavigation';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { isDefined } from 'twenty-shared/utils';

export const AddNodeWorkflowSingleRecordCommand = () => {
  const { recordId } = useEngineCommandExecutionContext();
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
