import { type SlackApiResponse } from 'src/engine/core-modules/slack-assistant/types/slack-api-response.type';
import { callSlackApi } from 'src/engine/core-modules/slack-assistant/utils/call-slack-api.util';

type SlackAuthTestResponse = SlackApiResponse & {
  team_id?: string;
};

export const fetchSlackTeamId = async (
  token: string,
): Promise<string | null> => {
  try {
    const response = await callSlackApi<SlackAuthTestResponse>(
      'auth.test',
      {},
      token,
    );

    return response.ok ? (response.team_id ?? null) : null;
  } catch {
    return null;
  }
};
