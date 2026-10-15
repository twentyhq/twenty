import { isDefined } from 'twenty-shared/utils';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { isOAuthOnlyApplication } from 'src/engine/core-modules/application/utils/is-oauth-only-application.util';
import { type WorkspaceAuthContextEntry } from 'src/engine/core-modules/auth/types/workspace-auth-context-entry.type';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type ApplicationReach } from 'src/engine/core-modules/authorization/application-reach/types/application-reach.type';

const findActingApplication = (
  authContext: WorkspaceAuthContext,
): Pick<FlatApplication, 'id' | 'sourceType'> | undefined => {
  switch (authContext.type) {
    case 'application':
      return authContext.application;
    case 'user':
      return authContext.application ?? authContext.viaApplication;
    default:
      return undefined;
  }
};

// undefined means nothing is reachable
export const resolveApplicationReach = ({
  entry,
  workspaceCustomApplicationId,
  twentyStandardApplicationId,
}: {
  entry: Pick<WorkspaceAuthContextEntry, 'authContext' | 'principal'>;
  workspaceCustomApplicationId: string;
  twentyStandardApplicationId: string | undefined;
}): ApplicationReach | undefined => {
  if (entry.principal.kind === 'unattested') {
    return undefined;
  }

  if (entry.principal.kind === 'system') {
    return { kind: 'workspace' };
  }

  const actingApplication = findActingApplication(entry.authContext);

  if (
    !isDefined(actingApplication) ||
    isOAuthOnlyApplication(actingApplication)
  ) {
    return { kind: 'workspace' };
  }

  // Automated runs of workspace workflows act as the standard application
  if (
    actingApplication.id === workspaceCustomApplicationId ||
    actingApplication.id === twentyStandardApplicationId
  ) {
    return { kind: 'composer', applicationId: actingApplication.id };
  }

  return { kind: 'confined', applicationId: actingApplication.id };
};
