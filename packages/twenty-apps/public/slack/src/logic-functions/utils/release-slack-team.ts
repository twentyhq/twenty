import { isNonEmptyString } from '@sniptt/guards';
import { kv } from 'twenty-sdk/logic-function';

import { getSlackConnectedAccountTeam } from 'src/logic-functions/utils/get-slack-connected-account-team';
import { getSlackConnectedAccountTeamKvKey } from 'src/logic-functions/utils/get-slack-connected-account-team-kv-key';
import { getSlackTeamKvKey } from 'src/logic-functions/utils/get-slack-team-kv-key';

type ReleaseSlackTeamArgs = {
  connectedAccountId: string;
};

export type ReleaseSlackTeamResult = {
  ok: true;
  releasedTeamId: string | null;
};

export const releaseSlackTeam = async ({
  connectedAccountId,
}: ReleaseSlackTeamArgs): Promise<ReleaseSlackTeamResult> => {
  if (!isNonEmptyString(connectedAccountId)) {
    throw new Error(
      'Slack team release failed: payload is missing connectedAccountId',
    );
  }

  const teamId = await getSlackConnectedAccountTeam(connectedAccountId);

  if (!isNonEmptyString(teamId)) {
    return { ok: true, releasedTeamId: null };
  }

  // Only clears the claim when this workspace still owns it, so a team another
  // workspace has since claimed stays routed where it is. The claim goes first
  // so a failure here leaves the mapping behind for the next attempt.
  await kv.delete(getSlackTeamKvKey(teamId), { scope: 'SERVER' });
  await kv.delete(getSlackConnectedAccountTeamKvKey(connectedAccountId));

  return { ok: true, releasedTeamId: teamId };
};
