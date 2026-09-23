import { kv } from 'twenty-sdk/logic-function';

import { SLACK_INSTALLED_TEAM_ID_KV_KEY } from 'src/logic-functions/constants/slack-installed-team-id-kv-key';
import { SLACK_INSTALLED_TEAM_ID_TTL_MS } from 'src/logic-functions/constants/slack-installed-team-id-ttl-ms';
import { type SlackInstalledTeamIdCacheEntry } from 'src/logic-functions/types/slack-installed-team-id-cache-entry.type';

export const cacheSlackInstalledTeamId = async (
  installedTeamId: string,
): Promise<void> => {
  await kv
    .set(SLACK_INSTALLED_TEAM_ID_KV_KEY, {
      installedTeamId,
      expiresAt: Date.now() + SLACK_INSTALLED_TEAM_ID_TTL_MS,
    } satisfies SlackInstalledTeamIdCacheEntry)
    .catch(async () => {
      await kv.delete(SLACK_INSTALLED_TEAM_ID_KV_KEY).catch(() => undefined);
    });
};
