import { useEffect } from 'react';
import { IconFilter, IconTrash } from 'twenty-ui/icon';

import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { CORE_WORKFLOWS_DELETE_COMMAND_ID } from '@/object-core/commands/constants/CoreWorkflowsDeleteCommandId';
import { CORE_WORKFLOWS_DELETE_CONFIRMATION_DIALOG_ID } from '@/object-core/commands/constants/CoreWorkflowsDeleteConfirmationDialogId';
import { CORE_WORKFLOW_FILTERS_COMMAND_ID } from '@/object-core/commands/constants/CoreWorkflowFiltersCommandId';
import { useCoreObjectsCommands } from '@/object-core/commands/hooks/useCoreObjectsCommands';
import { useDeleteSelectedCoreWorkflows } from '@/object-core/workflows/hooks/useDeleteSelectedCoreWorkflows';
import { useOpenCoreWorkflowFiltersSidePanel } from '@/object-core/workflows/hooks/useOpenCoreWorkflowFiltersSidePanel';
import { getDeleteCoreWorkflowsConfirmationContent } from '@/object-core/workflows/utils/getDeleteCoreWorkflowsConfirmationContent';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { ConfirmationDialog } from '@/ui/layout/dialog/components/ConfirmationDialog';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';

type CoreObjectsCommandsProps = {
  section: 'THIS_OBJECT' | 'SELECTION';
};

export const CoreObjectsCommands = ({ section }: CoreObjectsCommandsProps) => {
  const {
    coreWorkflowFiltersCommandLabel,
    shouldDisplayCoreWorkflowFiltersCommand,
    coreWorkflowsDeleteCommandLabel,
    shouldDisplayCoreWorkflowsDeleteCommand,
  } = useCoreObjectsCommands();

  const { openCoreWorkflowFiltersSidePanel } =
    useOpenCoreWorkflowFiltersSidePanel();

  const { deleteSelectedCoreWorkflows, selectedCoreWorkflowIds } =
    useDeleteSelectedCoreWorkflows();

  const { closeSidePanelMenu } = useSidePanelMenu();

  const { openDialog, closeDialog } = useDialog();

  useEffect(
    () => () => closeDialog(CORE_WORKFLOWS_DELETE_CONFIRMATION_DIALOG_ID),
    [closeDialog],
  );

  const openDeleteConfirmationDialog = () => {
    openDialog(CORE_WORKFLOWS_DELETE_CONFIRMATION_DIALOG_ID);
  };

  const handleConfirmDeleteSelectedCoreWorkflows = () => {
    closeSidePanelMenu();
    void deleteSelectedCoreWorkflows();
  };

  const deleteConfirmationContent = getDeleteCoreWorkflowsConfirmationContent(
    selectedCoreWorkflowIds.length,
  );

  return (
    <>
      {section === 'THIS_OBJECT' && shouldDisplayCoreWorkflowFiltersCommand && (
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
      {section === 'SELECTION' && shouldDisplayCoreWorkflowsDeleteCommand && (
        <>
          <SelectableListItem
            itemId={CORE_WORKFLOWS_DELETE_COMMAND_ID}
            onEnter={openDeleteConfirmationDialog}
          >
            <CommandMenuItem
              id={CORE_WORKFLOWS_DELETE_COMMAND_ID}
              label={coreWorkflowsDeleteCommandLabel}
              Icon={IconTrash}
              onClick={openDeleteConfirmationDialog}
            />
          </SelectableListItem>
          <ConfirmationDialog
            dialogId={CORE_WORKFLOWS_DELETE_CONFIRMATION_DIALOG_ID}
            title={deleteConfirmationContent.title}
            subtitle={deleteConfirmationContent.subtitle}
            confirmButtonText={deleteConfirmationContent.confirmButtonText}
            onConfirmClick={handleConfirmDeleteSelectedCoreWorkflows}
          />
        </>
      )}
    </>
  );
};
