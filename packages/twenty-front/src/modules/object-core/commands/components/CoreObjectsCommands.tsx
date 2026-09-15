import { IconFilter, IconTrash } from 'twenty-ui/icon';

import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { CORE_WORKFLOWS_DELETE_COMMAND_ID } from '@/object-core/commands/constants/CoreWorkflowsDeleteCommandId';
import { CORE_WORKFLOW_FILTERS_COMMAND_ID } from '@/object-core/commands/constants/CoreWorkflowFiltersCommandId';
import { useCoreObjectsCommands } from '@/object-core/commands/hooks/useCoreObjectsCommands';
import { useDeleteSelectedCoreWorkflows } from '@/object-core/workflows/hooks/useDeleteSelectedCoreWorkflows';
import { useOpenCoreWorkflowFiltersSidePanel } from '@/object-core/workflows/hooks/useOpenCoreWorkflowFiltersSidePanel';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';

export const CoreObjectsCommands = () => {
  const {
    coreWorkflowFiltersCommandLabel,
    shouldDisplayCoreWorkflowFiltersCommand,
    coreWorkflowsDeleteCommandLabel,
    shouldDisplayCoreWorkflowsDeleteCommand,
  } = useCoreObjectsCommands();

  const { openCoreWorkflowFiltersSidePanel } =
    useOpenCoreWorkflowFiltersSidePanel();

  const { deleteSelectedCoreWorkflows } = useDeleteSelectedCoreWorkflows();

  const { closeSidePanelMenu } = useSidePanelMenu();

  const handleDeleteSelectedCoreWorkflows = () => {
    closeSidePanelMenu();
    void deleteSelectedCoreWorkflows();
  };

  return (
    <>
      {shouldDisplayCoreWorkflowFiltersCommand && (
        <SelectableListItem
          itemId={CORE_WORKFLOW_FILTERS_COMMAND_ID}
          onEnter={openCoreWorkflowFiltersSidePanel}
        >
          <CommandMenuItem
            id={CORE_WORKFLOW_FILTERS_COMMAND_ID}
            label={coreWorkflowFiltersCommandLabel}
            Icon={IconFilter}
            onClick={openCoreWorkflowFiltersSidePanel}
          />
        </SelectableListItem>
      )}
      {shouldDisplayCoreWorkflowsDeleteCommand && (
        <SelectableListItem
          itemId={CORE_WORKFLOWS_DELETE_COMMAND_ID}
          onEnter={handleDeleteSelectedCoreWorkflows}
        >
          <CommandMenuItem
            id={CORE_WORKFLOWS_DELETE_COMMAND_ID}
            label={coreWorkflowsDeleteCommandLabel}
            Icon={IconTrash}
            onClick={handleDeleteSelectedCoreWorkflows}
          />
        </SelectableListItem>
      )}
    </>
  );
};
