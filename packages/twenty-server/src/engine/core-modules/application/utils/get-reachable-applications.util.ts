import { assertUnreachable, isDefined } from 'twenty-shared/utils';

import { type ApplicationCallerOperation } from 'src/engine/core-modules/application/types/application-caller-operation.type';
import { type ReachableApplications } from 'src/engine/core-modules/application/types/reachable-applications.type';
import { getScopedCallingApplication } from 'src/engine/core-modules/application/utils/get-scoped-calling-application.util';
import { isWorkspaceCustomApplication } from 'src/engine/core-modules/application/utils/is-workspace-custom-application.util';

// Sessions and API keys reach every application, behind their permission
// flags, and so does the workspace custom application when it reads or
// triggers. Any other caller reaches its own application only.
export const getReachableApplications = ({
  callingApplication,
  operation,
  workspaceCustomApplicationId,
}: ApplicationCallerOperation): ReachableApplications => {
  const scopedCallingApplication =
    getScopedCallingApplication(callingApplication);

  if (!isDefined(scopedCallingApplication)) {
    return { type: 'all' };
  }

  const ownApplication: ReachableApplications = {
    type: 'own',
    applicationId: scopedCallingApplication.id,
  };

  switch (operation) {
    case 'read':
    case 'trigger':
      return isWorkspaceCustomApplication({
        application: scopedCallingApplication,
        workspaceCustomApplicationId,
      })
        ? { type: 'all' }
        : ownApplication;
    case 'manage':
      return ownApplication;
    default:
      return assertUnreachable(operation);
  }
};
