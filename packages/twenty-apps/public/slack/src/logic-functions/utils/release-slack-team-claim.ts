import { isNonEmptyString } from '@sniptt/guards';
import { kv } from 'twenty-sdk/logic-function';

import { type ReleaseSlackTeamClaimResult } from 'src/logic-functions/types/release-slack-team-claim-result.type';
import { getSlackConnectedAccountTeamKvKey } from 'src/logic-functions/utils/get-slack-connected-account-team-kv-key';
import { getSlackTeamKvKey } from 'src/logic-functions/utils/get-slack-team-kv-key';

type ReleaseSlackTeamClaimArgs = {
  connectedAccountId: string;
  teamId: string | null;
};

export const releaseSlackTeamClaim = async ({
  connectedAccountId,
  teamId,
}: ReleaseSlackTeamClaimArgs): Promise<ReleaseSlackTeamClaimResult> => {
  const hasReleasedClaim = isNonEmptyString(teamId)
    ? await kv.delete(getSlackTeamKvKey(teamId), { scope: 'SERVER' })
    : false;

  await kv.delete(getSlackConnectedAccountTeamKvKey(connectedAccountId));

  return { ok: true, releasedTeamId: hasReleasedClaim ? teamId : null };
};
