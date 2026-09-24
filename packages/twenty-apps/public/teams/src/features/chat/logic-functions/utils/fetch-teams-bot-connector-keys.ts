import { isArray, isNonEmptyArray, isNonEmptyString } from '@sniptt/guards';
import { type JWK } from 'jose';
import { isDefined } from 'twenty-sdk/utils';

import { TEAMS_BOT_OPENID_KEYS_URL } from 'src/features/chat/logic-functions/constants/teams-bot-openid-keys-url';
import { type TeamsBotConnectorKey } from 'src/features/chat/logic-functions/types/teams-bot-connector-key.type';
import { isTeamsEndorsedKey } from 'src/features/chat/logic-functions/utils/is-teams-endorsed-key';

type PublishedBotConnectorKey = JWK & { endorsements?: string[] };

type TeamsBotConnectorKeysResponse = {
  keys?: PublishedBotConnectorKey[];
};

const isRsaSignatureKey = (
  key: PublishedBotConnectorKey,
): key is TeamsBotConnectorKey =>
  key.kty === 'RSA' &&
  isNonEmptyString(key.kid) &&
  isNonEmptyString(key.n) &&
  isNonEmptyString(key.e) &&
  (!isDefined(key.use) || key.use === 'sig');

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
    .filter(isRsaSignatureKey)
    .filter(isTeamsEndorsedKey)
    .map(toSigningKey);

  if (!isNonEmptyArray(teamsKeys)) {
    throw new Error(
      'Bot Connector signing keys response carried no key endorsed for Teams',
    );
  }

  return teamsKeys;
};
