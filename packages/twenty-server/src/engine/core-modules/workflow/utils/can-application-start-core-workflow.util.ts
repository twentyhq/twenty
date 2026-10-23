import { isDefined } from 'twenty-shared/utils';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { resolveApplicationReach } from 'src/engine/core-modules/application/utils/resolve-application-reach.util';

// OAuth clients own no workflows, so they start none
export const canApplicationStartCoreWorkflow = ({
  callerApplication,
  workspaceCustomApplicationId,
  workflowApplicationId,
}: {
  callerApplication:
    | Pick<FlatApplication, 'id' | 'universalIdentifier' | 'sourceType'>
    | undefined;
  workspaceCustomApplicationId: string;
  workflowApplicationId: string;
}): boolean =>
  !isDefined(callerApplication) ||
  workflowApplicationId === callerApplication.id ||
  resolveApplicationReach({
    callingApplication: callerApplication,
    workspaceCustomApplicationId,
  }) === 'composer';
