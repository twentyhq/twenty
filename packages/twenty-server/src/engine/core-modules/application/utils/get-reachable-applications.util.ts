import { isDefined } from 'twenty-shared/utils';

import { type ApplicationCallerAccess } from 'src/engine/core-modules/application/types/application-caller-access.type';
import { type ReachableApplications } from 'src/engine/core-modules/application/types/reachable-applications.type';
import { getScopedCallingApplication } from 'src/engine/core-modules/application/utils/get-scoped-calling-application.util';
import { isTwentyStandardApplication } from 'src/engine/core-modules/application/utils/is-twenty-standard-application.util';
import { isWorkspaceCustomApplication } from 'src/engine/core-modules/application/utils/is-workspace-custom-application.util';

// Sessions and API keys reach every application, behind their permission
// flags, and so does the workspace custom application when it reads or
// triggers. Any other caller reaches its own application only.
export const getReachableApplications = ({
  callingApplication,
  access,
  workspaceCustomApplicationId,
}: ApplicationCallerAccess): ReachableApplications => {
  const scopedCallingApplication =
    getScopedCallingApplication(callingApplication);

  if (!isDefined(scopedCallingApplication)) {
    return { type: 'all' };
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

  return reachesEveryApplication
    ? { type: 'all' }
    : { type: 'own', applicationId: scopedCallingApplication.id };
};
