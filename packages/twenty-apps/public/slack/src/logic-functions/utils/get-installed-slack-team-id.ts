import { type WebClient } from '@slack/web-api';
import { isNonEmptyString } from '@sniptt/guards';

export const getInstalledSlackTeamId = async (
  slackClient: WebClient,
): Promise<string | undefined> => {
  const authResult = await slackClient.auth.test().catch(() => undefined);
  const installedTeamId = authResult?.team_id;

  return isNonEmptyString(installedTeamId) ? installedTeamId : undefined;
};
