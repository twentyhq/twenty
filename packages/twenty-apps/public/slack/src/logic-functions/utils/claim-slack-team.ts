import { isNonEmptyString } from '@sniptt/guards';
import { getConnection, kv } from 'twenty-sdk/logic-function';

import { getSlackConnectedAccountTeamKvKey } from 'src/logic-functions/utils/get-slack-connected-account-team-kv-key';
import { getSlackTeamKvKey } from 'src/logic-functions/utils/get-slack-team-kv-key';
import { resolveSlackTeamId } from 'src/logic-functions/utils/resolve-slack-team-id';

type ClaimSlackTeamArgs = {
  connectedAccountId: string;
};

type ClaimSlackTeamResult = {
  ok: true;
  teamId: string;
};

export const claimSlackTeam = async ({
  connectedAccountId,
}: ClaimSlackTeamArgs): Promise<ClaimSlackTeamResult> => {
  if (!isNonEmptyString(connectedAccountId)) {
    throw new Error(
      'Slack team claim failed: onConnect payload is missing connectedAccountId',
    );
  }

  const connection = await getConnection(connectedAccountId);
  const teamId = await resolveSlackTeamId(connection.accessToken);

  if (!isNonEmptyString(teamId)) {
    throw new Error('Slack auth.test returned no team_id to claim');
  }

  await kv.set(getSlackConnectedAccountTeamKvKey(connectedAccountId), teamId);
  await kv.set(getSlackTeamKvKey(teamId), null, { scope: 'SERVER' });

  return { ok: true, teamId };
};
