import { WebClient } from '@slack/web-api';
import { isNonEmptyString } from '@sniptt/guards';

export const resolveSlackTeamId = async (
  accessToken: string,
): Promise<string | null> => {
  const authResult = await new WebClient(accessToken).auth.test();

  return isNonEmptyString(authResult.team_id) ? authResult.team_id : null;
};
