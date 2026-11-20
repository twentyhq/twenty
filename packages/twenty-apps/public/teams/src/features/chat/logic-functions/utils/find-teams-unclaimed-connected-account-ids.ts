import { isNonEmptyString } from '@sniptt/guards';
import { kv } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { type TeamsTenantClaimConflict } from 'src/features/chat/logic-functions/types/teams-tenant-claim-conflict.type';
import { buildTeamsConnectedAccountTenantKvKey } from 'src/features/chat/logic-functions/utils/build-teams-connected-account-tenant-kv-key';
import { buildTeamsTenantClaimConflictKvKey } from 'src/features/chat/logic-functions/utils/build-teams-tenant-claim-conflict-kv-key';

const isTeamsConnectedAccountUnclaimed = async (
  connectedAccountId: string,
): Promise<boolean> => {
  const claimedTenantId = await kv.get<string>(
    buildTeamsConnectedAccountTenantKvKey(connectedAccountId),
  );

  if (isNonEmptyString(claimedTenantId)) {
    return false;
  }

  const recordedConflict = await kv.get<TeamsTenantClaimConflict>(
    buildTeamsTenantClaimConflictKvKey(connectedAccountId),
  );

  return !isDefined(recordedConflict);
};

export const findTeamsUnclaimedConnectedAccountIds = async ({
  connectedAccountIds,
}: {
  connectedAccountIds: string[];
}): Promise<string[]> => {
  const unclaimedFlags = await Promise.all(
    connectedAccountIds.map(isTeamsConnectedAccountUnclaimed),
  );

  return connectedAccountIds.filter((_, index) => unclaimedFlags[index]);
};
