import { isDefined } from 'twenty-shared/utils';

import { isApiKeyAuthContext } from 'src/engine/core-modules/auth/guards/is-api-key-auth-context.guard';
import { isApplicationAuthContext } from 'src/engine/core-modules/auth/guards/is-application-auth-context.guard';
import { isUserAuthContext } from 'src/engine/core-modules/auth/guards/is-user-auth-context.guard';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type Spender } from 'src/engine/core-modules/usage-limit/types/spender.type';

export const buildSpendersFromAuthContext = (
  authContext: WorkspaceAuthContext,
): Spender[] => {
  const spenders: Spender[] = [];

  if (isApiKeyAuthContext(authContext)) {
    spenders.push({ spenderType: 'apiKey', spenderId: authContext.apiKey.id });
  }

  if (isApplicationAuthContext(authContext)) {
    spenders.push({
      spenderType: 'application',
      spenderId: authContext.application.id,
    });
  }

  if (isUserAuthContext(authContext)) {
    spenders.push({
      spenderType: 'userWorkspace',
      spenderId: authContext.userWorkspaceId,
    });

    const applicationId =
      authContext.application?.id ?? authContext.viaApplication?.id;

    if (isDefined(applicationId)) {
      spenders.push({ spenderType: 'application', spenderId: applicationId });
    }
  }

  spenders.push({ spenderType: 'workspace', spenderId: '' });

  return spenders;
};
