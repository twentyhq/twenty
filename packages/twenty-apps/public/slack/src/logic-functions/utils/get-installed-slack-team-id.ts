import { type WebClient } from '@slack/web-api';
import { isNonEmptyString } from '@sniptt/guards';

import { getSlackConnectedAccountTeam } from 'src/logic-functions/utils/get-slack-connected-account-team';
import { setSlackConnectedAccountTeam } from 'src/logic-functions/utils/set-slack-connected-account-team';

type SlackAuthTestClient = {
  auth: Pick<WebClient['auth'], 'test'>;
};

export const getInstalledSlackTeamId = async ({
  slackClient,
  slackConnectionId,
}: {
  slackClient: SlackAuthTestClient;
  slackConnectionId: string | undefined;
}): Promise<string | undefined> => {
  if (isNonEmptyString(slackConnectionId)) {
    const storedTeamId = await getSlackConnectedAccountTeam(
      slackConnectionId,
    ).catch(() => null);

    if (isNonEmptyString(storedTeamId)) {
      return storedTeamId;
    }
  }

  const authResult = await slackClient.auth.test().catch(() => undefined);
  const installedTeamId = authResult?.team_id;

  if (!isNonEmptyString(installedTeamId)) {
    return undefined;
  }

  // installs predating this read path have no stored team, so heal it here
  if (isNonEmptyString(slackConnectionId)) {
    await setSlackConnectedAccountTeam({
      connectedAccountId: slackConnectionId,
      slackTeamId: installedTeamId,
    }).catch(() => undefined);
  }

  return installedTeamId;
};
