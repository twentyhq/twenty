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
    frontComponentGlobalActions,
    frontComponentRecordSelectionActions,
    fallbackActions,
    createRelatedRecordActions,
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

  const matchingFrontComponentGlobalActions =
    filterActionsWithCommandMenuSearch(frontComponentGlobalActions);

  const matchingFrontComponentRecordSelectionActions =
    filterActionsWithCommandMenuSearch(frontComponentRecordSelectionActions);

  const matchingCreateRelatedRecordActions = filterActionsWithCommandMenuSearch(
    createRelatedRecordActions,
  );

  const noResults =
    !matchingStandardActionRecordSelectionActions.length &&
    !matchingWorkflowRunRecordSelectionActions.length &&
    !matchingFrontComponentRecordSelectionActions.length &&
    !matchingStandardActionGlobalActions.length &&
    !matchingWorkflowRunGlobalActions.length &&
    !matchingFrontComponentGlobalActions.length &&
    !matchingStandardActionObjectActions.length &&
    !matchingNavigateActions.length &&
    !matchingCreateRelatedRecordActions.length;

  return {
    noResults,
    matchingStandardActionRecordSelectionActions,
    matchingStandardActionObjectActions,
    matchingWorkflowRunRecordSelectionActions,
    matchingFrontComponentRecordSelectionActions,
    matchingStandardActionGlobalActions,
    matchingWorkflowRunGlobalActions,
    matchingFrontComponentGlobalActions,
    matchingNavigateActions,
    matchingCreateRelatedRecordActions,
    fallbackActions: noResults ? fallbackActions : [],
  };
};
