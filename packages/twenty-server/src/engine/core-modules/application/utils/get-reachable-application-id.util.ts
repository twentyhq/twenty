import { isDefined } from 'twenty-shared/utils';

import { type ApplicationCallerAccess } from 'src/engine/core-modules/application/types/application-caller-access.type';
import { getScopedCallingApplication } from 'src/engine/core-modules/application/utils/get-scoped-calling-application.util';
import { isTwentyStandardApplication } from 'src/engine/core-modules/application/utils/is-twenty-standard-application.util';
import { isWorkspaceCustomApplication } from 'src/engine/core-modules/application/utils/is-workspace-custom-application.util';

// Undefined when every application is reachable: for sessions and API keys,
// which their permission flags govern, and for the workspace custom
// application reading or triggering. Otherwise only the caller's own one is.
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

  // The standard application shares this reach while automated workspace
  // workflow runs and its built-in helper agent still act through it
  const reachesEveryApplication =
    access !== 'manage' &&
    (isWorkspaceCustomApplication({
      application: scopedCallingApplication,
      workspaceCustomApplicationId,
    }) ||
      isTwentyStandardApplication(scopedCallingApplication));

  return reachesEveryApplication ? undefined : scopedCallingApplication.id;
};
