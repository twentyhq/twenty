import { kv } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { TEAMS_BOT_CONNECTOR_KEYS_KV_KEY } from 'src/features/chat/logic-functions/constants/teams-bot-connector-keys-kv-key';
import { TEAMS_BOT_CONNECTOR_KEYS_MAX_AGE_MS } from 'src/features/chat/logic-functions/constants/teams-bot-connector-keys-max-age-ms';
import { TEAMS_BOT_CONNECTOR_KEYS_MIN_REFRESH_INTERVAL_MS } from 'src/features/chat/logic-functions/constants/teams-bot-connector-keys-min-refresh-interval-ms';
import { type TeamsBotConnectorKey } from 'src/features/chat/logic-functions/types/teams-bot-connector-key.type';
import { type TeamsBotConnectorKeysCacheEntry } from 'src/features/chat/logic-functions/types/teams-bot-connector-keys-cache-entry.type';
import { fetchTeamsBotConnectorKeys } from 'src/features/chat/logic-functions/utils/fetch-teams-bot-connector-keys';

const isWithin = (timestampMs: number, maxAgeMs: number): boolean =>
  timestampMs + maxAgeMs > Date.now();

const canReuse = (
  entry: TeamsBotConnectorKeysCacheEntry,
  forceRefresh: boolean,
): boolean =>
  forceRefresh
    ? isWithin(
        entry.refreshAttemptedAtMs,
        TEAMS_BOT_CONNECTOR_KEYS_MIN_REFRESH_INTERVAL_MS,
      )
    : isWithin(entry.fetchedAtMs, TEAMS_BOT_CONNECTOR_KEYS_MAX_AGE_MS);

// An unknown key id normally means Microsoft rotated the signing keys, but it
// is also what a forged token carries. The refresh attempt is stamped before
// the fetch so concurrent invocations back off on the stamp rather than each
// racing the fetch, and a failed fetch keeps serving the last good key set.
export const getTeamsBotConnectorKeys = async ({
  forceRefresh = false,
}: {
  forceRefresh?: boolean;
} = {}): Promise<TeamsBotConnectorKey[]> => {
  const cachedEntry = await kv.get<TeamsBotConnectorKeysCacheEntry>(
    TEAMS_BOT_CONNECTOR_KEYS_KV_KEY,
  );

  if (isDefined(cachedEntry) && canReuse(cachedEntry, forceRefresh)) {
    return cachedEntry.keys;
  }

  if (isDefined(cachedEntry)) {
    await kv.set<TeamsBotConnectorKeysCacheEntry>(
      TEAMS_BOT_CONNECTOR_KEYS_KV_KEY,
      { ...cachedEntry, refreshAttemptedAtMs: Date.now() },
    );
  }

  try {
    const keys = await fetchTeamsBotConnectorKeys();

    await kv.set<TeamsBotConnectorKeysCacheEntry>(
      TEAMS_BOT_CONNECTOR_KEYS_KV_KEY,
      { keys, fetchedAtMs: Date.now(), refreshAttemptedAtMs: Date.now() },
    );

    return keys;
  } catch (error) {
    if (isDefined(cachedEntry)) {
      return cachedEntry.keys;
    }

    throw error;
  }
};
