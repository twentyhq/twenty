import { WebClient } from '@slack/web-api';
import { isNonEmptyString } from '@sniptt/guards';
import { getConnection, kv } from 'twenty-sdk/logic-function';

import { SLACK_BOT_USER_ID_KV_KEY } from 'src/logic-functions/constants/slack-bot-user-id-kv-key';
import { getSlackTeamKvKey } from 'src/logic-functions/utils/get-slack-team-kv-key';

type RegisterSlackConnectionArgs = {
  connectedAccountId: string;
};

type RegisterSlackConnectionResult = {
  ok: true;
  teamId: string;
};

export const registerSlackConnection = async ({
  connectedAccountId,
}: RegisterSlackConnectionArgs): Promise<RegisterSlackConnectionResult> => {
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

  // TODO: release the claim on disconnect once connection providers expose an onDisconnect hook.
  await kv.set(getSlackTeamKvKey(teamId), null, { scope: 'SERVER' });

  if (isNonEmptyString(authResult.user_id)) {
    await kv
      .set(SLACK_BOT_USER_ID_KV_KEY, authResult.user_id)
      .catch(() => undefined);
  }

  return { ok: true, teamId };
};
