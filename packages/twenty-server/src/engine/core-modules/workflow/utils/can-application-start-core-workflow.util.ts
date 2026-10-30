import { isDefined } from 'twenty-shared/utils';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { isWorkspaceCustomApplication } from 'src/engine/core-modules/application/utils/is-workspace-custom-application.util';

export const canApplicationStartCoreWorkflow = ({
  callerApplication,
  workspaceCustomApplicationId,
  workflowApplicationId,
}: {
  callerApplication: Pick<FlatApplication, 'id'> | undefined;
  workspaceCustomApplicationId: string;
  workflowApplicationId: string;
}): boolean =>
  !isDefined(callerApplication) ||
  workflowApplicationId === callerApplication.id ||
  isWorkspaceCustomApplication({
    application: callerApplication,
    workspaceCustomApplicationId,
  });
