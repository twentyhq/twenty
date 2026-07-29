import { isNonEmptyString } from '@sniptt/guards';
import { kv } from 'twenty-sdk/logic-function';

import { getSlackConnectedAccountTeamKvKey } from 'src/logic-functions/utils/get-slack-connected-account-team-kv-key';
import { getSlackTeamKvKey } from 'src/logic-functions/utils/get-slack-team-kv-key';

type ReleaseSlackTeamArgs = {
  connectedAccountId: string;
};

type ReleaseSlackTeamResult = {
  ok: true;
  teamId: string | null;
};

export const releaseSlackTeam = async ({
  connectedAccountId,
}: ReleaseSlackTeamArgs): Promise<ReleaseSlackTeamResult> => {
  if (!isNonEmptyString(connectedAccountId)) {
    throw new Error(
      'Slack team release failed: onDisconnect payload is missing connectedAccountId',
    );
  }

  const connectedAccountTeamKey =
    getSlackConnectedAccountTeamKvKey(connectedAccountId);

  const teamId = await kv.get<string>(connectedAccountTeamKey);

  if (!isNonEmptyString(teamId)) {
    return { ok: true, teamId: null };
  }

  // Only clears the claim when this workspace still owns it, so a team another
  // workspace has since claimed stays routed where it is.
  await kv.delete(getSlackTeamKvKey(teamId), { scope: 'SERVER' });
  await kv.delete(connectedAccountTeamKey);

  return { ok: true, teamId };
};
