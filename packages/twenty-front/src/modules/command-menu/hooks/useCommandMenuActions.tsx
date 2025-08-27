import { type ActionConfig } from '@/action-menu/actions/types/ActionConfig';
import { ActionScope } from '@/action-menu/actions/types/ActionScope';
import { ActionType } from '@/action-menu/actions/types/ActionType';
import { ActionMenuContext } from '@/action-menu/contexts/ActionMenuContext';
import { useContext } from 'react';

export const useCommandMenuActions = () => {
  const { actions } = useContext(ActionMenuContext);

  const navigateActions = actions?.filter(
    (action) => action.type === ActionType.Navigation,
  );

  const actionRecordSelectionActions: ActionConfig[] = actions?.filter(
    (action) =>
      action.type === ActionType.Standard &&
      action.scope === ActionScope.RecordSelection,
  );

  const actionObjectActions: ActionConfig[] = actions?.filter(
    (action) =>
      action.type === ActionType.Standard &&
      action.scope === ActionScope.Object,
  );

  const actionGlobalActions: ActionConfig[] = actions?.filter(
    (action) =>
      action.type === ActionType.Standard &&
      action.scope === ActionScope.Global,
  );

  const workflowRunRecordSelectionActions: ActionConfig[] = actions?.filter(
    (action) =>
      action.type === ActionType.WorkflowRun &&
      action.scope === ActionScope.RecordSelection,
  );

  const workflowRunGlobalActions: ActionConfig[] = actions?.filter(
    (action) =>
      action.type === ActionType.WorkflowRun &&
      action.scope === ActionScope.Global,
  );

  const fallbackActions: ActionConfig[] = actions?.filter(
    (action) => action.type === ActionType.Fallback,
  );

  const createRelatedRecordActions: ActionConfig[] = actions?.filter(
    (action) =>
      action.type === ActionType.Standard &&
      action.scope === ActionScope.CreateRelatedRecord,
  );

  return {
    navigateActions,
    actionRecordSelectionActions,
    actionGlobalActions,
    actionObjectActions,
    workflowRunRecordSelectionActions,
    workflowRunGlobalActions,
    fallbackActions,
    createRelatedRecordActions,
  };
};
