import { isDefined } from 'twenty-shared/utils';

import { type ApplicationCallerAccess } from 'src/engine/core-modules/application/types/application-caller-access.type';
import { getScopedCallingApplication } from 'src/engine/core-modules/application/utils/get-scoped-calling-application.util';
import { isWorkspaceComposerApplication } from 'src/engine/core-modules/application/utils/is-workspace-composer-application.util';

// Undefined when every application is reachable: for sessions and API keys,
// which their permission flags govern, and for the workspace composer reading
// or triggering. Otherwise only the caller's own application is.
export const getReachableApplicationId = ({
  callingApplication,
  access,
  workspaceCustomApplicationId,
}: ApplicationCallerAccess): string | undefined => {
  const scopedCallingApplication =
    getScopedCallingApplication(callingApplication);

  if (!isDefined(scopedCallingApplication)) {
    return undefined;
  }

  const reachesEveryApplication =
    access !== 'manage' &&
    isWorkspaceComposerApplication({
      application: scopedCallingApplication,
      workspaceCustomApplicationId,
    });

  return reachesEveryApplication ? undefined : scopedCallingApplication.id;
};
