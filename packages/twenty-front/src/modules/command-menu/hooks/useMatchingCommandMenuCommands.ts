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
    actionGlobalCommands,
    workflowRunRecordSelectionCommands,
    workflowRunGlobalCommands,
    peopleCommands,
    companyCommands,
    opportunityCommands,
    noteCommands,
    tasksCommands,
    customObjectCommands,
    loading,
  } = useCommandMenuCommands();

  const matchingNavigateCommand = matchCommands(navigateCommands);

  const matchingStandardActionRecordSelectionCommands = matchCommands(
    actionRecordSelectionCommands,
  );

  const matchingStandardActionGlobalCommands =
    matchCommands(actionGlobalCommands);

  const matchingWorkflowRunRecordSelectionCommands = matchCommands(
    workflowRunRecordSelectionCommands,
  );

  const matchingWorkflowRunGlobalCommands = matchCommands(
    workflowRunGlobalCommands,
  );

  const noResults =
    !matchingStandardActionRecordSelectionCommands.length &&
    !matchingWorkflowRunRecordSelectionCommands.length &&
    !matchingStandardActionGlobalCommands.length &&
    !matchingWorkflowRunGlobalCommands.length &&
    !matchingNavigateCommand.length &&
    !peopleCommands?.length &&
    !companyCommands?.length &&
    !opportunityCommands?.length &&
    !noteCommands?.length &&
    !tasksCommands?.length &&
    !customObjectCommands?.length;

  return {
    noResults,
    loading,
    copilotCommands,
    matchingStandardActionRecordSelectionCommands,
    matchingWorkflowRunRecordSelectionCommands,
    matchingStandardActionGlobalCommands,
    matchingWorkflowRunGlobalCommands,
    matchingNavigateCommand,
    peopleCommands,
    companyCommands,
    opportunityCommands,
    noteCommands,
    tasksCommands,
    customObjectCommands,
  };
};
