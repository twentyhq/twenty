import { isArray, isNonEmptyString, isObject } from '@sniptt/guards';

import { TEAMS_BOT_OPENID_KEYS_URL } from 'src/features/chat/logic-functions/constants/teams-bot-openid-keys-url';
import { TEAMS_CHANNEL_ID } from 'src/features/chat/logic-functions/constants/teams-channel-id';
import { type TeamsBotConnectorKey } from 'src/features/chat/logic-functions/types/teams-bot-connector-key.type';

type TeamsBotConnectorKeysResponse = {
  keys?: unknown;
};

const hasKeyId = (key: unknown): key is TeamsBotConnectorKey =>
  isObject(key) && 'kid' in key && isNonEmptyString(key.kid);

const isEndorsedForTeams = (key: TeamsBotConnectorKey): boolean =>
  isArray(key.endorsements) && key.endorsements.includes(TEAMS_CHANNEL_ID);

// The published document carries a certificate chain per key and keys for
// every Bot Framework channel, which is twenty times what verification reads.
// Only the RSA public parameters and the endorsements are kept in the cache.
const toSigningKey = ({
  kty,
  kid,
  use,
  alg,
  n,
  e,
  endorsements,
}: TeamsBotConnectorKey): TeamsBotConnectorKey => ({
  kty,
  kid,
  use,
  alg,
  n,
  e,
  endorsements,
});

export const fetchTeamsBotConnectorKeys = async (): Promise<
  TeamsBotConnectorKey[]
> => {
  const response = await fetch(TEAMS_BOT_OPENID_KEYS_URL);

  if (!response.ok) {
    throw new Error(
      `Failed to fetch the Bot Connector signing keys: ${response.status} ${response.statusText}`,
    );
  }

  const body: TeamsBotConnectorKeysResponse = await response.json();

  if (!isArray(body.keys)) {
    throw new Error('Bot Connector signing keys response carried no keys');
  }

  return body.keys
    .filter(hasKeyId)
    .filter(isEndorsedForTeams)
    .map(toSigningKey);
};
