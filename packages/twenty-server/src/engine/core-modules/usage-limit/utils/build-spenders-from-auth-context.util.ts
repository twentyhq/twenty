import { isDefined } from 'twenty-shared/utils';

import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type Spender } from 'src/engine/core-modules/usage-limit/types/spender.type';
import { buildUsageSpendersFromAuthContext } from 'src/engine/core-modules/usage/utils/build-usage-spenders-from-auth-context.util';

export const buildSpendersFromAuthContext = (
  authContext: WorkspaceAuthContext,
): Spender[] => {
  const { userWorkspaceId, apiKeyId, applicationId } =
    buildUsageSpendersFromAuthContext(authContext);

  const spenders: Spender[] = [];

  if (isDefined(userWorkspaceId)) {
    spenders.push({ spenderType: 'userWorkspace', spenderId: userWorkspaceId });
  }

  if (isDefined(apiKeyId)) {
    spenders.push({ spenderType: 'apiKey', spenderId: apiKeyId });
  }

  if (isDefined(applicationId)) {
    spenders.push({ spenderType: 'application', spenderId: applicationId });
  }

  spenders.push({ spenderType: 'workspace', spenderId: '' });

  return spenders;
};
