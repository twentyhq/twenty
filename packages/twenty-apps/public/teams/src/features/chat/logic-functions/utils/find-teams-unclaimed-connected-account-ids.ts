import { isNonEmptyString } from '@sniptt/guards';
import { kv } from 'twenty-sdk/logic-function';

import { buildTeamsConnectedAccountTenantKvKey } from 'src/features/chat/logic-functions/utils/build-teams-connected-account-tenant-kv-key';

export const findTeamsUnclaimedConnectedAccountIds = async ({
  connectedAccountIds,
}: {
  connectedAccountIds: string[];
}): Promise<string[]> => {
  const claimedTenantIds = await Promise.all(
    connectedAccountIds.map((connectedAccountId) =>
      kv.get<string>(buildTeamsConnectedAccountTenantKvKey(connectedAccountId)),
    ),
  );

  return connectedAccountIds.filter(
    (_, index) => !isNonEmptyString(claimedTenantIds[index]),
  );
};
