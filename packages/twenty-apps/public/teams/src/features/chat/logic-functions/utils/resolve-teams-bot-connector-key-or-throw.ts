import { isDefined } from 'twenty-sdk/utils';

import { type LoadTeamsBotConnectorKeys } from 'src/features/chat/logic-functions/types/load-teams-bot-connector-keys.type';
import { type TeamsBotConnectorKey } from 'src/features/chat/logic-functions/types/teams-bot-connector-key.type';
import { getTeamsBotConnectorKeys } from 'src/features/chat/logic-functions/utils/get-teams-bot-connector-keys';

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
