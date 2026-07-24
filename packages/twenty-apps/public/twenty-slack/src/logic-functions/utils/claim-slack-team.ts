import { WebClient } from '@slack/web-api';
import { isNonEmptyString } from '@sniptt/guards';
import { getConnection, kv } from 'twenty-sdk/logic-function';

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

  // SERVER-scoped keys are a claim registry: the server always stores the
  // calling workspace id and rejects a claim held by another workspace.
  // TODO: release the claim on disconnect once connection providers expose an
  // onDisconnect hook.
  await kv.set(getSlackTeamKvKey(teamId), null, { scope: 'SERVER' });

  return { ok: true, teamId };
};
