import { isDefined } from 'twenty-shared/utils';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { isTwentyStandardApplication } from 'src/engine/core-modules/application/utils/is-twenty-standard-application.util';
import { isApplicationAuthContext } from 'src/engine/core-modules/auth/guards/is-application-auth-context.guard';
import { isUserAuthContext } from 'src/engine/core-modules/auth/guards/is-user-auth-context.guard';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';

const getAuthContextApplication = (
  authContext: WorkspaceAuthContext,
): FlatApplication | undefined => {
  if (isApplicationAuthContext(authContext)) {
    return authContext.application;
  }

  if (isUserAuthContext(authContext)) {
    return authContext.application ?? authContext.viaApplication;
  }

  return undefined;
};

// Automated workspace workflow runs and the built-in helper agent act through
// the standard application, and keep their workspace-wide reach until they act
// through the application that owns them
export const resolveAgentRunCallingApplication = (
  authContext?: WorkspaceAuthContext,
): FlatApplication | undefined => {
  if (!isDefined(authContext)) {
    return undefined;
  }

  const application = getAuthContextApplication(authContext);

  return isDefined(application) && isTwentyStandardApplication(application)
    ? undefined
    : application;
};
