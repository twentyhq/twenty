import { type CommandMenuItemConfig } from '@/command-menu-item/types/CommandMenuItemConfig';
import { CommandMenuItemScope } from '@/command-menu-item/types/CommandMenuItemScope';
import { CommandMenuItemType } from '@/command-menu-item/types/CommandMenuItemType';
import { CommandMenuContext } from '@/command-menu-item/contexts/CommandMenuContext';
import { useContext } from 'react';

export const useSidePanelActions = () => {
  const { commandMenuItems } = useContext(CommandMenuContext);

  const navigateActions = commandMenuItems?.filter(
    (action) => action.type === CommandMenuItemType.Navigation,
  );

  const actionRecordSelectionActions: CommandMenuItemConfig[] =
    commandMenuItems?.filter(
      (action) =>
        action.type === CommandMenuItemType.Standard &&
        action.scope === CommandMenuItemScope.RecordSelection,
    );

  const actionObjectActions: CommandMenuItemConfig[] = commandMenuItems?.filter(
    (action) =>
      action.type === CommandMenuItemType.Standard &&
      action.scope === CommandMenuItemScope.Object,
  );

  const actionGlobalActions: CommandMenuItemConfig[] = commandMenuItems?.filter(
    (action) =>
      action.type === CommandMenuItemType.Standard &&
      action.scope === CommandMenuItemScope.Global,
  );

  const workflowRunRecordSelectionActions: CommandMenuItemConfig[] =
    commandMenuItems?.filter(
      (action) =>
        action.type === CommandMenuItemType.WorkflowRun &&
        action.scope === CommandMenuItemScope.RecordSelection,
    );

  const workflowRunGlobalActions: CommandMenuItemConfig[] =
    commandMenuItems?.filter(
      (action) =>
        action.type === CommandMenuItemType.WorkflowRun &&
        action.scope === CommandMenuItemScope.Global,
    );

  const frontComponentGlobalActions: CommandMenuItemConfig[] =
    commandMenuItems?.filter(
      (action) =>
        action.type === CommandMenuItemType.FrontComponent &&
        action.scope === CommandMenuItemScope.Global,
    );

  const frontComponentRecordSelectionActions: CommandMenuItemConfig[] =
    commandMenuItems?.filter(
      (action) =>
        action.type === CommandMenuItemType.FrontComponent &&
        action.scope === CommandMenuItemScope.RecordSelection,
    );

  const fallbackActions: CommandMenuItemConfig[] = commandMenuItems?.filter(
    (action) => action.type === CommandMenuItemType.Fallback,
  );

  const createRelatedRecordActions: CommandMenuItemConfig[] =
    commandMenuItems?.filter(
      (action) =>
        action.type === CommandMenuItemType.Standard &&
        action.scope === CommandMenuItemScope.CreateRelatedRecord,
    );

  return {
    navigateActions,
    actionRecordSelectionActions,
    actionGlobalActions,
    actionObjectActions,
    workflowRunRecordSelectionActions,
    workflowRunGlobalActions,
    frontComponentGlobalActions,
    frontComponentRecordSelectionActions,
    fallbackActions,
    createRelatedRecordActions,
  };
};
