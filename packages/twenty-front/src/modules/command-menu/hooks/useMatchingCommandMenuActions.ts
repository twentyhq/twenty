import { useCommandMenuActions } from '@/command-menu/hooks/useCommandMenuActions';
import { useFilterActionsWithCommandMenuSearch } from '@/command-menu/hooks/useFilterActionsWithCommandMenuSearch';

export const useMatchingCommandMenuActions = ({
  commandMenuSearch,
}: {
  commandMenuSearch: string;
}) => {
  const { filterActionsWithCommandMenuSearch } =
    useFilterActionsWithCommandMenuSearch({
      commandMenuSearch,
    });

  const {
    navigateActions,
    actionRecordSelectionActions,
    actionObjectActions,
    actionGlobalActions,
    workflowRunRecordSelectionActions,
    workflowRunGlobalActions,
    fallbackActions,
  } = useCommandMenuActions();

  const matchingNavigateActions =
    filterActionsWithCommandMenuSearch(navigateActions);

  const matchingStandardActionRecordSelectionActions =
    filterActionsWithCommandMenuSearch(actionRecordSelectionActions);

  const matchingStandardActionObjectActions =
    filterActionsWithCommandMenuSearch(actionObjectActions);

  const matchingStandardActionGlobalActions =
    filterActionsWithCommandMenuSearch(actionGlobalActions);

  const matchingWorkflowRunRecordSelectionActions =
    filterActionsWithCommandMenuSearch(workflowRunRecordSelectionActions);

  const matchingWorkflowRunGlobalActions = filterActionsWithCommandMenuSearch(
    workflowRunGlobalActions,
  );

  const noResults =
    !matchingStandardActionRecordSelectionActions.length &&
    !matchingWorkflowRunRecordSelectionActions.length &&
    !matchingStandardActionGlobalActions.length &&
    !matchingWorkflowRunGlobalActions.length &&
    !matchingStandardActionObjectActions.length &&
    !matchingNavigateActions.length;

  return {
    noResults,
    matchingStandardActionRecordSelectionActions,
    matchingStandardActionObjectActions,
    matchingWorkflowRunRecordSelectionActions,
    matchingStandardActionGlobalActions,
    matchingWorkflowRunGlobalActions,
    matchingNavigateActions,
    fallbackActions: noResults ? fallbackActions : [],
  };
};
