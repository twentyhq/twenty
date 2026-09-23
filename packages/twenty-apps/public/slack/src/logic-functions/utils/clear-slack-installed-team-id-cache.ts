import { kv } from 'twenty-sdk/logic-function';

import { SLACK_INSTALLED_TEAM_ID_KV_KEY } from 'src/logic-functions/constants/slack-installed-team-id-kv-key';

export const clearSlackInstalledTeamIdCache = async (): Promise<void> => {
  await kv.delete(SLACK_INSTALLED_TEAM_ID_KV_KEY).catch(() => undefined);
};
