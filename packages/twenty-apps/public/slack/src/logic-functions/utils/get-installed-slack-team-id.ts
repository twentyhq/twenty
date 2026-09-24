import { isNonEmptyString } from '@sniptt/guards';

import { cacheSlackConnectedAccountTeam } from 'src/logic-functions/utils/cache-slack-connected-account-team';
import { getSlackConnectedAccountTeam } from 'src/logic-functions/utils/get-slack-connected-account-team';
import { getSlackConnection } from 'src/logic-functions/utils/get-slack-connection';

type SlackAuthTestClient = {
  auth: { test: () => Promise<{ team_id?: string }> };
};

export const getInstalledSlackTeamId = async (
  slackClient: SlackAuthTestClient,
): Promise<string | undefined> => {
  const connectionResult = await getSlackConnection();
  const connectionId = connectionResult.success
    ? connectionResult.connectionId
    : undefined;

  if (isNonEmptyString(connectionId)) {
    const storedTeamId = await getSlackConnectedAccountTeam(connectionId).catch(
      () => null,
    );

    if (isNonEmptyString(storedTeamId)) {
      return storedTeamId;
    }
  }

  const authResult = await slackClient.auth.test().catch(() => undefined);
  const installedTeamId = authResult?.team_id;

  if (!isNonEmptyString(installedTeamId)) {
    return undefined;
  }

  // Installs predating this read path have no stored team, so healing the
  // entry here is what stops every later call falling back to Slack.
  if (isNonEmptyString(connectionId)) {
    await cacheSlackConnectedAccountTeam(connectionId, installedTeamId).catch(
      () => undefined,
    );
  }

  return installedTeamId;
};
