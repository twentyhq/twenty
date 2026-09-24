import { isDefined } from 'twenty-sdk/utils';

import { type TeamsBotConnectorKey } from 'src/features/chat/logic-functions/types/teams-bot-connector-key.type';
import { getTeamsBotConnectorKeys } from 'src/features/chat/logic-functions/utils/get-teams-bot-connector-keys';

export type LoadTeamsBotConnectorKeys = typeof getTeamsBotConnectorKeys;

const findKey = ({
  keys,
  keyId,
}: {
  keys: TeamsBotConnectorKey[];
  keyId: string;
}) => keys.find((key) => key.kid === keyId);

export const resolveTeamsBotConnectorKeyOrThrow = async ({
  keyId,
  loadKeys = getTeamsBotConnectorKeys,
}: {
  keyId: string;
  loadKeys?: LoadTeamsBotConnectorKeys;
}): Promise<TeamsBotConnectorKey> => {
  const cachedKey = findKey({ keys: await loadKeys(), keyId });

  if (isDefined(cachedKey)) {
    return cachedKey;
  }

  const refreshedKey = findKey({
    keys: await loadKeys({ forceRefresh: true }),
    keyId,
  });

  if (isDefined(refreshedKey)) {
    return refreshedKey;
  }

  throw new Error(
    'Teams activity token is signed with a key the Bot Connector does not publish',
  );
};
