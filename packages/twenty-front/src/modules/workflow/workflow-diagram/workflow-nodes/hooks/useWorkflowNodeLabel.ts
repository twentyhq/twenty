import { isTwentyStandardApplication } from '@/applications/utils/isTwentyStandardApplication';
import { isWorkspaceCustomApplication } from '@/applications/utils/isWorkspaceCustomApplication';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { logicFunctionsSelector } from '@/logic-functions/states/logicFunctionsSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { type WorkflowDiagramStepNodeData } from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { capitalize, isDefined } from 'twenty-shared/utils';

export const useWorkflowNodeLabel = (
  data: WorkflowDiagramStepNodeData,
): string => {
  const logicFunctions = useAtomStateValue(logicFunctionsSelector);
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);

  const logicFunctionId =
    data.nodeType === 'action' ? data.logicFunctionId : undefined;

  const applicationId = isDefined(logicFunctionId)
    ? logicFunctions.find(
        (logicFunction) => logicFunction.id === logicFunctionId,
      )?.applicationId
    : undefined;

  const application = currentWorkspace?.installedApplications.find(
    (installedApplication) => installedApplication.id === applicationId,
  );

  const isIntegrationApplication =
    isDefined(application) &&
    !isTwentyStandardApplication(application) &&
    !isWorkspaceCustomApplication(application, currentWorkspace);

  if (isIntegrationApplication) {
    return application.name;
  }

  return capitalize(data.nodeType);
};
