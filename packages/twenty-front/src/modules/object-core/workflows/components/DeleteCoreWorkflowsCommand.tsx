import { AppPath } from 'twenty-shared/types';
import { isNonEmptyArray } from 'twenty-shared/utils';
import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useHeadlessCommandContextApi } from '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi';
import { useDeleteSelectedCoreWorkflows } from '@/object-core/workflows/hooks/useDeleteSelectedCoreWorkflows';
import { CoreObjectNamePlural } from '@/object-metadata/types/CoreObjectNamePlural';
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
    navigate(AppPath.RecordIndexPage, {
      objectNamePlural: CoreObjectNamePlural.Workflow,
    });
  };

  return <HeadlessEngineCommandWrapperEffect execute={execute} />;
};
