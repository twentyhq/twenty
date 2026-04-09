import { useFilterActionsWithSidePanelSearch } from '@/side-panel/pages/root/hooks/useFilterActionsWithSidePanelSearch';
import { useSidePanelActions } from '@/side-panel/pages/root/hooks/useSidePanelActions';

export const useSidePanelMatchingActions = ({
  sidePanelSearch,
}: {
  sidePanelSearch: string;
}) => {
  const { filterActionsWithSidePanelSearch } =
    useFilterActionsWithSidePanelSearch({
      sidePanelSearch: sidePanelSearch,
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
  } = useSidePanelActions();

  const matchingNavigateActions =
    filterActionsWithSidePanelSearch(navigateActions);

  const matchingStandardActionRecordSelectionActions =
    filterActionsWithSidePanelSearch(actionRecordSelectionActions);

  const matchingStandardActionObjectActions =
    filterActionsWithSidePanelSearch(actionObjectActions);

  const matchingStandardActionGlobalActions =
    filterActionsWithSidePanelSearch(actionGlobalActions);

  const matchingWorkflowRunRecordSelectionActions =
    filterActionsWithSidePanelSearch(workflowRunRecordSelectionActions);

  const matchingWorkflowRunGlobalActions = filterActionsWithSidePanelSearch(
    workflowRunGlobalActions,
  );

  const matchingFrontComponentGlobalActions = filterActionsWithSidePanelSearch(
    frontComponentGlobalActions,
  );

  const matchingFrontComponentRecordSelectionActions =
    filterActionsWithSidePanelSearch(frontComponentRecordSelectionActions);

  const matchingCreateRelatedRecordActions = filterActionsWithSidePanelSearch(
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
