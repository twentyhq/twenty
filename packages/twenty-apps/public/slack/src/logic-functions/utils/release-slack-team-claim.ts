import { isNonEmptyString } from '@sniptt/guards';
import { kv } from 'twenty-sdk/logic-function';

import { getSlackConnectedAccountTeamKvKey } from 'src/logic-functions/utils/get-slack-connected-account-team-kv-key';
import { getSlackTeamKvKey } from 'src/logic-functions/utils/get-slack-team-kv-key';

type ReleaseSlackTeamClaimArgs = {
  connectedAccountId: string;
  teamId: string | null;
};

export type ReleaseSlackTeamResult = {
  ok: true;
  releasedTeamId: string | null;
};

export const releaseSlackTeamClaim = async ({
  connectedAccountId,
  teamId,
}: ReleaseSlackTeamClaimArgs): Promise<ReleaseSlackTeamResult> => {
  if (!isNonEmptyString(teamId)) {
    return { ok: true, releasedTeamId: null };
  }

  const hasReleasedClaim = await kv.delete(getSlackTeamKvKey(teamId), {
    scope: 'SERVER',
  });

  await kv.delete(getSlackConnectedAccountTeamKvKey(connectedAccountId));

  return { ok: true, releasedTeamId: hasReleasedClaim ? teamId : null };
};
