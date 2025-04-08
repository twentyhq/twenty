import { useCommandMenuActions } from '@/command-menu/hooks/useCommandMenuActions';
import { useMatchActions } from '@/command-menu/hooks/useMatchActions';

export const useMatchingCommandMenuCommands = ({
  commandMenuSearch,
}: {
  commandMenuSearch: string;
}) => {
  const { matchActions } = useMatchActions({ commandMenuSearch });

  const {
    navigateActions,
    actionRecordSelectionActions,
    actionObjectActions,
    actionGlobalActions,
    workflowRunRecordSelectionActions,
    workflowRunGlobalActions,
    fallbackActions,
  } = useCommandMenuActions();

  const matchingNavigateActions = matchActions(navigateActions);

  const matchingStandardActionRecordSelectionActions = matchActions(
    actionRecordSelectionActions,
  );

  const matchingStandardActionObjectActions = matchActions(actionObjectActions);

  const matchingStandardActionGlobalActions = matchActions(actionGlobalActions);

  const matchingWorkflowRunRecordSelectionActions = matchActions(
    workflowRunRecordSelectionActions,
  );

  const matchingWorkflowRunGlobalActions = matchActions(
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
