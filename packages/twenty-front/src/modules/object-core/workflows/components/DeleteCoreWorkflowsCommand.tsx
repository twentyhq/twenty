import { AppPath } from 'twenty-shared/types';
import { isNonEmptyArray } from 'twenty-shared/utils';
import { HeadlessConfirmationModalEngineCommandEffect } from '@/command-menu-item/engine-command/components/HeadlessConfirmationModalEngineCommandEffect';
import { useHeadlessCommandContextApi } from '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi';
import { useDeleteSelectedCoreWorkflows } from '@/object-core/workflows/hooks/useDeleteSelectedCoreWorkflows';
import { getDeleteCoreWorkflowsConfirmationContent } from '@/object-core/workflows/utils/getDeleteCoreWorkflowsConfirmationContent';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { useNavigateApp } from '~/hooks/useNavigateApp';

export const DeleteCoreWorkflowsCommand = () => {
  const { selectedRecords } = useHeadlessCommandContextApi();
  const { deleteSelectedCoreWorkflows } = useDeleteSelectedCoreWorkflows();
  const navigate = useNavigateApp();
  const { closeSidePanelMenu } = useSidePanelMenu();

  const execute = async () => {
    const coreWorkflowIds = selectedRecords.map(({ id }) => id);
    if (!isNonEmptyArray(coreWorkflowIds)) {
      return;
    }
    const wereCoreWorkflowsDeleted =
      await deleteSelectedCoreWorkflows(coreWorkflowIds);
    if (!wereCoreWorkflowsDeleted) {
      return;
    }
    closeSidePanelMenu();
    navigate(AppPath.WorkflowIndexPage);
  };

  const { title, subtitle, confirmButtonText } =
    getDeleteCoreWorkflowsConfirmationContent(selectedRecords.length);

  return (
    <HeadlessConfirmationModalEngineCommandEffect
      title={title}
      subtitle={subtitle}
      confirmButtonText={confirmButtonText}
      execute={execute}
    />
  );
};
