import { WebClient } from '@slack/web-api';
import { isNonEmptyString } from '@sniptt/guards';
import { getConnection, kv } from 'twenty-sdk/logic-function';

import { getSlackConnectedAccountTeamKvKey } from 'src/logic-functions/utils/get-slack-connected-account-team-kv-key';
import { getSlackTeamKvKey } from 'src/logic-functions/utils/get-slack-team-kv-key';

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
  const client = new WebClient(connection.accessToken);
  const authResult = await client.auth.test();
  const teamId = authResult.team_id;

  if (!isNonEmptyString(teamId)) {
    throw new Error('Slack auth.test returned no team_id to claim');
  }

  // The connection is already gone by the time the onDisconnect hook runs, so
  // the team it claimed has to be resolvable from the connectedAccountId alone.
  // Recorded before the claim: a mapping without a claim releases nothing,
  // while a claim without a mapping could never be released at all.
  await kv.set(getSlackConnectedAccountTeamKvKey(connectedAccountId), teamId);

  await kv.set(getSlackTeamKvKey(teamId), null, { scope: 'SERVER' });

  return { ok: true, teamId };
};
