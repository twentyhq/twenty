import { type CommandMenuItemConfig } from '@/action-menu/actions/types/CommandMenuItemConfig';
import { CommandMenuItemScope } from '@/action-menu/actions/types/CommandMenuItemScope';
import { CommandMenuItemType } from '@/action-menu/actions/types/CommandMenuItemType';
import { CommandMenuItemContext } from '@/action-menu/contexts/CommandMenuItemContext';
import { useContext } from 'react';

export const useSidePanelActions = () => {
  const { actions } = useContext(CommandMenuItemContext);

  const navigateActions = actions?.filter(
    (action) => action.type === CommandMenuItemType.Navigation,
  );

  const actionRecordSelectionActions: CommandMenuItemConfig[] = actions?.filter(
    (action) =>
      action.type === CommandMenuItemType.Standard &&
      action.scope === CommandMenuItemScope.RecordSelection,
  );

  const actionObjectActions: CommandMenuItemConfig[] = actions?.filter(
    (action) =>
      action.type === CommandMenuItemType.Standard &&
      action.scope === CommandMenuItemScope.Object,
  );

  const actionGlobalActions: CommandMenuItemConfig[] = actions?.filter(
    (action) =>
      action.type === CommandMenuItemType.Standard &&
      action.scope === CommandMenuItemScope.Global,
  );

  const workflowRunRecordSelectionActions: CommandMenuItemConfig[] = actions?.filter(
    (action) =>
      action.type === CommandMenuItemType.WorkflowRun &&
      action.scope === CommandMenuItemScope.RecordSelection,
  );

  const workflowRunGlobalActions: CommandMenuItemConfig[] = actions?.filter(
    (action) =>
      action.type === CommandMenuItemType.WorkflowRun &&
      action.scope === CommandMenuItemScope.Global,
  );

  const frontComponentGlobalActions: CommandMenuItemConfig[] = actions?.filter(
    (action) =>
      action.type === CommandMenuItemType.FrontComponent &&
      action.scope === CommandMenuItemScope.Global,
  );

  const frontComponentRecordSelectionActions: CommandMenuItemConfig[] = actions?.filter(
    (action) =>
      action.type === CommandMenuItemType.FrontComponent &&
      action.scope === CommandMenuItemScope.RecordSelection,
  );

  const fallbackActions: CommandMenuItemConfig[] = actions?.filter(
    (action) => action.type === CommandMenuItemType.Fallback,
  );

  const createRelatedRecordActions: CommandMenuItemConfig[] = actions?.filter(
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
