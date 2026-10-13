import { isDefined } from 'twenty-shared/utils';

export const canApplicationStartCoreWorkflow = ({
  callerApplicationId,
  workflowApplicationId,
  workspaceCustomApplicationId,
}: {
  callerApplicationId: string | undefined;
  workflowApplicationId: string;
  workspaceCustomApplicationId: string;
}): boolean =>
  !isDefined(callerApplicationId) ||
  workflowApplicationId === workspaceCustomApplicationId ||
  workflowApplicationId === callerApplicationId;
