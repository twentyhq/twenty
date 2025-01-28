import { useCommandMenuCommands } from '@/command-menu/hooks/useCommandMenuCommands';
import { useMatchCommands } from '@/command-menu/hooks/useMatchCommands';

export const useMatchingCommandMenuCommands = ({
  commandMenuSearch,
}: {
  commandMenuSearch: string;
}) => {
  const { matchCommands } = useMatchCommands({ commandMenuSearch });

  const {
    copilotCommands,
    navigateCommands,
    actionRecordSelectionCommands,
    actionObjectCommands,
    actionGlobalCommands,
    workflowRunRecordSelectionCommands,
    workflowRunGlobalCommands,
  } = useCommandMenuCommands();

  const matchingNavigateCommands = matchCommands(navigateCommands);

  const matchingStandardActionRecordSelectionCommands = matchCommands(
    actionRecordSelectionCommands,
  );

  const matchingStandardActionObjectCommands =
    matchCommands(actionObjectCommands);

  const matchingStandardActionGlobalCommands =
    matchCommands(actionGlobalCommands);

  const matchingWorkflowRunRecordSelectionCommands = matchCommands(
    workflowRunRecordSelectionCommands,
  );

  const matchingWorkflowRunGlobalCommands = matchCommands(
    workflowRunGlobalCommands,
  );

  const noResult =
    !matchingStandardActionRecordSelectionCommands.length &&
    !matchingWorkflowRunRecordSelectionCommands.length &&
    !matchingStandardActionGlobalCommands.length &&
    !matchingWorkflowRunGlobalCommands.length &&
    !matchingNavigateCommands.length;

  return {
    noResult,
    copilotCommands,
    matchingStandardActionRecordSelectionCommands,
    matchingStandardActionObjectCommands,
    matchingWorkflowRunRecordSelectionCommands,
    matchingStandardActionGlobalCommands,
    matchingWorkflowRunGlobalCommands,
    matchingNavigateCommands,
  };
};
