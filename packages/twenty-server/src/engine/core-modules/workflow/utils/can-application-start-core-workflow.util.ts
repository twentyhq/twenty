import { isDefined } from 'twenty-shared/utils';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { isWorkspaceComposerApplication } from 'src/engine/core-modules/application/utils/is-workspace-composer-application.util';

export const canApplicationStartCoreWorkflow = ({
  callerApplication,
  workspaceCustomApplicationId,
  workflowApplicationId,
}: {
  callerApplication:
    | Pick<FlatApplication, 'id' | 'universalIdentifier'>
    | undefined;
  workspaceCustomApplicationId: string;
  workflowApplicationId: string;
}): boolean =>
  !isDefined(callerApplication) ||
  workflowApplicationId === callerApplication.id ||
  isWorkspaceComposerApplication({
    application: callerApplication,
    workspaceCustomApplicationId,
  });
