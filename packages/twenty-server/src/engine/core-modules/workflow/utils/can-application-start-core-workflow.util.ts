import { isDefined } from 'twenty-shared/utils';

export const canApplicationStartCoreWorkflow = ({
  callerApplicationId,
  workflowApplicationId,
  workspaceOwnedApplicationIds,
}: {
  callerApplicationId: string | undefined;
  workflowApplicationId: string;
  workspaceOwnedApplicationIds: string[];
}): boolean =>
  !isDefined(callerApplicationId) ||
  workspaceOwnedApplicationIds.includes(workflowApplicationId) ||
  workflowApplicationId === callerApplicationId;
