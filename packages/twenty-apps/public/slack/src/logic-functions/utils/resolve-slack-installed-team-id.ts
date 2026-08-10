import { type WebClient } from '@slack/web-api';
import { isNonEmptyString } from '@sniptt/guards';
import { kv } from 'twenty-sdk/logic-function';

import { SLACK_INSTALLED_TEAM_ID_KV_KEY } from 'src/logic-functions/constants/slack-installed-team-id-kv-key';
import { SLACK_INSTALLED_TEAM_ID_TTL_MS } from 'src/logic-functions/constants/slack-installed-team-id-ttl-ms';
import { type SlackInstalledTeamIdCacheEntry } from 'src/logic-functions/types/slack-installed-team-id-cache-entry.type';
import { hasKvEntryExpired } from 'src/logic-functions/utils/has-kv-entry-expired';

const readCachedTeamId = async (): Promise<string | undefined> => {
  const cacheEntry = await kv
    .get<SlackInstalledTeamIdCacheEntry>(SLACK_INSTALLED_TEAM_ID_KV_KEY)
    .catch(() => null);

  if (
    cacheEntry === null ||
    !isNonEmptyString(cacheEntry.teamId) ||
    hasKvEntryExpired(cacheEntry)
  ) {
    return undefined;
  }

  return cacheEntry.teamId;
};

export const resolveSlackInstalledTeamId = async (
  client: WebClient,
): Promise<string | undefined> => {
  const cachedTeamId = await readCachedTeamId();

  if (isNonEmptyString(cachedTeamId)) {
    return cachedTeamId;
  }

  const authResult = await client.auth.test().catch(() => undefined);
  const teamId = authResult?.team_id;

  if (!isNonEmptyString(teamId)) {
    return undefined;
  }

  await kv
    .set(SLACK_INSTALLED_TEAM_ID_KV_KEY, {
      teamId,
      expiresAt: Date.now() + SLACK_INSTALLED_TEAM_ID_TTL_MS,
    } satisfies SlackInstalledTeamIdCacheEntry)
    .catch(async () => {
      await kv.delete(SLACK_INSTALLED_TEAM_ID_KV_KEY).catch(() => undefined);
    });

  return teamId;
};
