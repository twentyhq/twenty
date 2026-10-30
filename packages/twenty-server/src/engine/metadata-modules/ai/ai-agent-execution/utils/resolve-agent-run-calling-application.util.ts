import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
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

export const resolveAgentRunCallingApplication = (
  authContext?: WorkspaceAuthContext,
): FlatApplication | undefined => {
  if (!isDefined(authContext)) {
    return undefined;
  }

  const application = getAuthContextApplication(authContext);

  if (
    application?.id === authContext.workspace.workspaceCustomApplicationId ||
    application?.universalIdentifier ===
      TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER
  ) {
    return undefined;
  }

  return application;
};
