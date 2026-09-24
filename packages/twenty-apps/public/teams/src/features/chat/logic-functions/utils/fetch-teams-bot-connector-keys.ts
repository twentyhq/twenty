import {
  isArray,
  isNonEmptyArray,
  isNonEmptyString,
  isObject,
} from '@sniptt/guards';

import { TEAMS_BOT_OPENID_KEYS_URL } from 'src/features/chat/logic-functions/constants/teams-bot-openid-keys-url';
import { type TeamsBotConnectorKey } from 'src/features/chat/logic-functions/types/teams-bot-connector-key.type';
import { isTeamsEndorsedKey } from 'src/features/chat/logic-functions/utils/is-teams-endorsed-key';

type TeamsBotConnectorKeysResponse = {
  keys?: unknown;
};

const hasKeyId = (key: unknown): key is TeamsBotConnectorKey =>
  isObject(key) && 'kid' in key && isNonEmptyString(key.kid);

// The published document carries a certificate chain per key and keys for
// every Bot Framework channel, twenty times what verification reads.
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

  const teamsKeys = body.keys
    .filter(hasKeyId)
    .filter(isTeamsEndorsedKey)
    .map(toSigningKey);

  if (!isNonEmptyArray(teamsKeys)) {
    throw new Error(
      'Bot Connector signing keys response carried no key endorsed for Teams',
    );
  }

  return teamsKeys;
};
