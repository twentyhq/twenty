import { WebClient } from '@slack/web-api';
import { isNonEmptyString } from '@sniptt/guards';
import { getConnection, kv } from 'twenty-sdk/logic-function';

import { cacheSlackBotUserId } from 'src/logic-functions/utils/cache-slack-bot-user-id';
import { getSlackConnectedAccountTeamKvKey } from 'src/logic-functions/utils/get-slack-connected-account-team-kv-key';
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
      'Slack connection registration failed: onConnect payload is missing connectedAccountId',
    );
  }

  const connection = await getConnection(connectedAccountId);
  const client = new WebClient(connection.accessToken);
  const { team_id: teamId, user_id: botUserId } = await client.auth.test();

  if (!isNonEmptyString(teamId)) {
    throw new Error('Slack auth.test returned no team_id to claim');
  }

  if (!isNonEmptyString(botUserId)) {
    throw new Error('Slack auth.test returned no user_id for the bot');
  }

  await kv.set(getSlackConnectedAccountTeamKvKey(connectedAccountId), teamId);
  await kv.set(getSlackTeamKvKey(teamId), null, { scope: 'SERVER' });

  await cacheSlackBotUserId(botUserId);

  return { ok: true, teamId };
};
