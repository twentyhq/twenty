import {
  ActionMenuEntry,
  ActionMenuEntryScope,
  ActionMenuEntryType,
} from '@/action-menu/types/ActionMenuEntry';
import { COMMAND_MENU_COMMANDS } from '@/command-menu/constants/CommandMenuCommands';
import {
  Command,
  CommandScope,
  CommandType,
} from '@/command-menu/types/Command';

export const computeCommandMenuCommands = (
  actionMenuEntries: ActionMenuEntry[],
): Command[] => {
  const commands = Object.values(COMMAND_MENU_COMMANDS);

  const actionCommands: Command[] = actionMenuEntries
    ?.filter(
      (actionMenuEntry) =>
        actionMenuEntry.type === ActionMenuEntryType.Standard,
    )
    ?.map((actionMenuEntry) => ({
      id: actionMenuEntry.key,
      label: actionMenuEntry.label,
      Icon: actionMenuEntry.Icon,
      onCommandClick: actionMenuEntry.onClick,
      type: CommandType.StandardAction,
      scope:
        actionMenuEntry.scope === ActionMenuEntryScope.RecordSelection
          ? CommandScope.RecordSelection
          : CommandScope.Global,
    }));

  const workflowRunCommands: Command[] = actionMenuEntries
    ?.filter(
      (actionMenuEntry) =>
        actionMenuEntry.type === ActionMenuEntryType.WorkflowRun,
    )
    ?.map((actionMenuEntry) => ({
      id: actionMenuEntry.key,
      label: actionMenuEntry.label,
      Icon: actionMenuEntry.Icon,
      onCommandClick: actionMenuEntry.onClick,
      type: CommandType.WorkflowRun,
      scope:
        actionMenuEntry.scope === ActionMenuEntryScope.RecordSelection
          ? CommandScope.RecordSelection
          : CommandScope.Global,
    }));

  return [...commands, ...actionCommands, ...workflowRunCommands];
};
