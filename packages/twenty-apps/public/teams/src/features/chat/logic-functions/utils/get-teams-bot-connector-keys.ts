import { kv } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { TEAMS_BOT_CONNECTOR_KEYS_KV_KEY } from 'src/features/chat/logic-functions/constants/teams-bot-connector-keys-kv-key';
import { TEAMS_BOT_CONNECTOR_KEYS_MAX_AGE_MS } from 'src/features/chat/logic-functions/constants/teams-bot-connector-keys-max-age-ms';
import { TEAMS_BOT_CONNECTOR_KEYS_MIN_REFRESH_INTERVAL_MS } from 'src/features/chat/logic-functions/constants/teams-bot-connector-keys-min-refresh-interval-ms';
import { type TeamsBotConnectorKey } from 'src/features/chat/logic-functions/types/teams-bot-connector-key.type';
import { type TeamsBotConnectorKeysCacheEntry } from 'src/features/chat/logic-functions/types/teams-bot-connector-keys-cache-entry.type';
import { fetchTeamsBotConnectorKeys } from 'src/features/chat/logic-functions/utils/fetch-teams-bot-connector-keys';

const isFetchedWithin = (
  entry: TeamsBotConnectorKeysCacheEntry | null,
  maxAgeMs: number,
): entry is TeamsBotConnectorKeysCacheEntry =>
  isDefined(entry) && entry.fetchedAtMs + maxAgeMs > Date.now();

// An unknown key id normally means Microsoft rotated the signing keys, but it
// is also what a forged token carries, so a forced refresh is rate limited
// rather than letting every rejected request hit the keys endpoint.
export const getTeamsBotConnectorKeys = async ({
  forceRefresh = false,
}: {
  forceRefresh?: boolean;
} = {}): Promise<TeamsBotConnectorKey[]> => {
  const cachedEntry = await kv.get<TeamsBotConnectorKeysCacheEntry>(
    TEAMS_BOT_CONNECTOR_KEYS_KV_KEY,
  );

  const reuseMaxAgeMs = forceRefresh
    ? TEAMS_BOT_CONNECTOR_KEYS_MIN_REFRESH_INTERVAL_MS
    : TEAMS_BOT_CONNECTOR_KEYS_MAX_AGE_MS;

  if (isFetchedWithin(cachedEntry, reuseMaxAgeMs)) {
    return cachedEntry.keys;
  }

  const keys = await fetchTeamsBotConnectorKeys();

  await kv.set<TeamsBotConnectorKeysCacheEntry>(
    TEAMS_BOT_CONNECTOR_KEYS_KV_KEY,
    { keys, fetchedAtMs: Date.now() },
  );

  return keys;
};
