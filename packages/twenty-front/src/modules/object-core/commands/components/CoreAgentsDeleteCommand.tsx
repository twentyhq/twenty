import { IconTrash } from 'twenty-ui/icon';

import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { useDeleteSelectedCoreAgents } from '@/object-core/agents/hooks/useDeleteSelectedCoreAgents';
import { getDeleteCoreAgentsConfirmationContent } from '@/object-core/agents/utils/getDeleteCoreAgentsConfirmationContent';
import { CoreAgentsDeleteConfirmationDialogCleanupEffect } from '@/object-core/commands/components/CoreAgentsDeleteConfirmationDialogCleanupEffect';
import { CORE_AGENTS_DELETE_COMMAND_ID } from '@/object-core/commands/constants/CoreAgentsDeleteCommandId';
import { CORE_AGENTS_DELETE_CONFIRMATION_DIALOG_ID } from '@/object-core/commands/constants/CoreAgentsDeleteConfirmationDialogId';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { ConfirmationDialog } from '@/ui/layout/dialog/components/ConfirmationDialog';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';

type CoreAgentsDeleteCommandProps = {
  label: string;
};

export const CoreAgentsDeleteCommand = ({
  label,
}: CoreAgentsDeleteCommandProps) => {
  const { deleteSelectedCoreAgents, selectedCoreAgentIds } =
    useDeleteSelectedCoreAgents();
  const { closeSidePanelMenu } = useSidePanelMenu();
  const { openDialog } = useDialog();

  const openDeleteConfirmationDialog = () => {
    openDialog(CORE_AGENTS_DELETE_CONFIRMATION_DIALOG_ID);
  };

  const handleConfirmDelete = () => {
    closeSidePanelMenu();
    void deleteSelectedCoreAgents();
  };

  const { title, subtitle, confirmButtonText } =
    getDeleteCoreAgentsConfirmationContent(selectedCoreAgentIds.length);

  return (
    <>
      <SelectableListItem
        itemId={CORE_AGENTS_DELETE_COMMAND_ID}
        onEnter={openDeleteConfirmationDialog}
      >
        <CommandMenuItem
          id={CORE_AGENTS_DELETE_COMMAND_ID}
          label={label}
          Icon={IconTrash}
          onClick={openDeleteConfirmationDialog}
        />
      </SelectableListItem>
      <ConfirmationDialog
        dialogId={CORE_AGENTS_DELETE_CONFIRMATION_DIALOG_ID}
        title={title}
        subtitle={subtitle}
        confirmButtonText={confirmButtonText}
        onConfirmClick={handleConfirmDelete}
      />
      <CoreAgentsDeleteConfirmationDialogCleanupEffect />
    </>
  );
};
