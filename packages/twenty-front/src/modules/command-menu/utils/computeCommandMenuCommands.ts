import { ActionMenuEntry } from '@/action-menu/types/ActionMenuEntry';
import { COMMAND_MENU_COMMANDS } from '@/command-menu/constants/CommandMenuCommands';
import { CommandType } from '@/command-menu/types/Command';

export const computeCommandMenuCommands = (
  actionMenuEntries: ActionMenuEntry[],
) => {
  const commands = Object.values(COMMAND_MENU_COMMANDS);

  const actionCommands = actionMenuEntries
    ?.filter((actionMenuEntry) => actionMenuEntry.type === 'standard')
    ?.map((actionMenuEntry) => ({
      id: actionMenuEntry.key,
      label: actionMenuEntry.label,
      Icon: actionMenuEntry.Icon,
      onCommandClick: actionMenuEntry.onClick,
      type: CommandType.StandardAction,
    }));

  const workflowRunCommands = actionMenuEntries
    ?.filter((actionMenuEntry) => actionMenuEntry.type === 'workflow-run')
    ?.map((actionMenuEntry) => ({
      id: actionMenuEntry.key,
      label: actionMenuEntry.label,
      Icon: actionMenuEntry.Icon,
      onCommandClick: actionMenuEntry.onClick,
      type: CommandType.WorkflowRun,
    }));

  return [...commands, ...actionCommands, ...workflowRunCommands];
};
