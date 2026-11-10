import { IconTrash } from 'twenty-ui/icon';

import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { CORE_AGENT_DELETE_DIALOG_ID } from '@/object-core/agents/constants/CoreAgentDeleteDialogId';
import { CORE_AGENT_DELETE_CURRENT_COMMAND_ID } from '@/object-core/commands/constants/CoreAgentDeleteCurrentCommandId';
import { useCoreAgentPageCommands } from '@/object-core/commands/hooks/useCoreAgentPageCommands';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';

export const CoreAgentPageCommands = () => {
  const { deleteCurrentCommandLabel, shouldDisplayDeleteCurrentCommand } =
    useCoreAgentPageCommands();
  const { closeSidePanelMenu } = useSidePanelMenu();
  const { openDialog } = useDialog();

  const handleDelete = () => {
    closeSidePanelMenu();
    openDialog(CORE_AGENT_DELETE_DIALOG_ID);
  };

  if (!shouldDisplayDeleteCurrentCommand) {
    return null;
  }

  return (
    <SelectableListItem
      itemId={CORE_AGENT_DELETE_CURRENT_COMMAND_ID}
      onEnter={handleDelete}
    >
      <CommandMenuItem
        id={CORE_AGENT_DELETE_CURRENT_COMMAND_ID}
        label={deleteCurrentCommandLabel}
        Icon={IconTrash}
        onClick={handleDelete}
      />
    </SelectableListItem>
  );
};
