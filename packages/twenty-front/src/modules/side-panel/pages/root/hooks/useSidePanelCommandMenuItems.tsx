import { type CommandMenuItemConfig } from '@/command-menu-item/types/CommandMenuItemConfig';
import { CommandMenuItemScope } from '@/command-menu-item/types/CommandMenuItemScope';
import { CommandMenuItemType } from '@/command-menu-item/types/CommandMenuItemType';
import { CommandMenuContext } from '@/command-menu-item/contexts/CommandMenuContext';
import { useContext } from 'react';

export const useSidePanelCommandMenuItems = () => {
  const { commandMenuItems } = useContext(CommandMenuContext);

  const navigationCommandMenuItems = commandMenuItems?.filter(
    (commandMenuItem) =>
      commandMenuItem.type === CommandMenuItemType.Navigation,
  );

  const recordSelectionCommandMenuItems: CommandMenuItemConfig[] =
    commandMenuItems?.filter(
      (commandMenuItem) =>
        commandMenuItem.type === CommandMenuItemType.Standard &&
        commandMenuItem.scope === CommandMenuItemScope.RecordSelection,
    );

  const objectCommandMenuItems: CommandMenuItemConfig[] =
    commandMenuItems?.filter(
      (commandMenuItem) =>
        commandMenuItem.type === CommandMenuItemType.Standard &&
        commandMenuItem.scope === CommandMenuItemScope.Object,
    );

  const globalCommandMenuItems: CommandMenuItemConfig[] =
    commandMenuItems?.filter(
      (commandMenuItem) =>
        commandMenuItem.type === CommandMenuItemType.Standard &&
        commandMenuItem.scope === CommandMenuItemScope.Global,
    );

  const workflowRunRecordSelectionCommandMenuItems: CommandMenuItemConfig[] =
    commandMenuItems?.filter(
      (commandMenuItem) =>
        commandMenuItem.type === CommandMenuItemType.WorkflowRun &&
        commandMenuItem.scope === CommandMenuItemScope.RecordSelection,
    );

  const workflowRunGlobalCommandMenuItems: CommandMenuItemConfig[] =
    commandMenuItems?.filter(
      (commandMenuItem) =>
        commandMenuItem.type === CommandMenuItemType.WorkflowRun &&
        commandMenuItem.scope === CommandMenuItemScope.Global,
    );

  const frontComponentGlobalCommandMenuItems: CommandMenuItemConfig[] =
    commandMenuItems?.filter(
      (commandMenuItem) =>
        commandMenuItem.type === CommandMenuItemType.FrontComponent &&
        commandMenuItem.scope === CommandMenuItemScope.Global,
    );

  const frontComponentRecordSelectionCommandMenuItems: CommandMenuItemConfig[] =
    commandMenuItems?.filter(
      (commandMenuItem) =>
        commandMenuItem.type === CommandMenuItemType.FrontComponent &&
        commandMenuItem.scope === CommandMenuItemScope.RecordSelection,
    );

  const fallbackCommandMenuItems: CommandMenuItemConfig[] =
    commandMenuItems?.filter(
      (commandMenuItem) =>
        commandMenuItem.type === CommandMenuItemType.Fallback,
    );

  const createRelatedRecordCommandMenuItems: CommandMenuItemConfig[] =
    commandMenuItems?.filter(
      (commandMenuItem) =>
        commandMenuItem.type === CommandMenuItemType.Standard &&
        commandMenuItem.scope === CommandMenuItemScope.CreateRelatedRecord,
    );

  return {
    navigationCommandMenuItems,
    recordSelectionCommandMenuItems,
    globalCommandMenuItems,
    objectCommandMenuItems,
    workflowRunRecordSelectionCommandMenuItems,
    workflowRunGlobalCommandMenuItems,
    frontComponentGlobalCommandMenuItems,
    frontComponentRecordSelectionCommandMenuItems,
    fallbackCommandMenuItems,
    createRelatedRecordCommandMenuItems,
  };
};
