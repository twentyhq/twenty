import { ActionConfig } from '@/action-menu/actions/types/ActionConfig';
import { useRegisteredActions } from '@/action-menu/hooks/useRegisteredActions';
import {
  ActionMenuEntryScope,
  ActionMenuEntryType,
} from '@/action-menu/types/ActionMenuEntry';

export const useCommandMenuActions = () => {
  const actions = useRegisteredActions();

  const navigateActions = actions?.filter(
    (action) => action.type === ActionMenuEntryType.Navigation,
  );

  const actionRecordSelectionActions: ActionConfig[] = actions?.filter(
    (action) =>
      action.type === ActionMenuEntryType.Standard &&
      action.scope === ActionMenuEntryScope.RecordSelection,
  );

  const actionObjectActions: ActionConfig[] = actions?.filter(
    (action) =>
      action.type === ActionMenuEntryType.Standard &&
      action.scope === ActionMenuEntryScope.Object,
  );

  const actionGlobalActions: ActionConfig[] = actions?.filter(
    (action) =>
      action.type === ActionMenuEntryType.Standard &&
      action.scope === ActionMenuEntryScope.Global,
  );

  const workflowRunRecordSelectionActions: ActionConfig[] = actions?.filter(
    (action) =>
      action.type === ActionMenuEntryType.WorkflowRun &&
      action.scope === ActionMenuEntryScope.RecordSelection,
  );

  const workflowRunGlobalActions: ActionConfig[] = actions?.filter(
    (action) =>
      action.type === ActionMenuEntryType.WorkflowRun &&
      action.scope === ActionMenuEntryScope.Global,
  );

  const fallbackActions: ActionConfig[] = actions?.filter(
    (action) => action.type === ActionMenuEntryType.Fallback,
  );

  return {
    navigateActions,
    actionRecordSelectionActions,
    actionGlobalActions,
    actionObjectActions,
    workflowRunRecordSelectionActions,
    workflowRunGlobalActions,
    fallbackActions,
  };
};
