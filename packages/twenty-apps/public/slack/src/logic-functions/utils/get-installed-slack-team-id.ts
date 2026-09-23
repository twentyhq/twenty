import { type WebClient } from '@slack/web-api';
import { isNonEmptyString } from '@sniptt/guards';
import { kv } from 'twenty-sdk/logic-function';

import { SLACK_INSTALLED_TEAM_ID_KV_KEY } from 'src/logic-functions/constants/slack-installed-team-id-kv-key';
import { type SlackInstalledTeamIdCacheEntry } from 'src/logic-functions/types/slack-installed-team-id-cache-entry.type';
import { cacheSlackInstalledTeamId } from 'src/logic-functions/utils/cache-slack-installed-team-id';
import { hasKvEntryExpired } from 'src/logic-functions/utils/has-kv-entry-expired';

const readCachedInstalledTeamId = async (): Promise<string | undefined> => {
  const cacheEntry = await kv
    .get<SlackInstalledTeamIdCacheEntry>(SLACK_INSTALLED_TEAM_ID_KV_KEY)
    .catch(() => null);

  if (
    cacheEntry === null ||
    !isNonEmptyString(cacheEntry.installedTeamId) ||
    hasKvEntryExpired(cacheEntry)
  ) {
    return undefined;
  }

  return cacheEntry.installedTeamId;
};

export const getInstalledSlackTeamId = async (
  slackClient: WebClient,
): Promise<string | undefined> => {
  const cachedInstalledTeamId = await readCachedInstalledTeamId();

  if (isNonEmptyString(cachedInstalledTeamId)) {
    return cachedInstalledTeamId;
  }

  const authResult = await slackClient.auth.test().catch(() => undefined);
  const installedTeamId = authResult?.team_id;

  if (!isNonEmptyString(installedTeamId)) {
    return undefined;
  }

  await cacheSlackInstalledTeamId(installedTeamId);

  return installedTeamId;
};
