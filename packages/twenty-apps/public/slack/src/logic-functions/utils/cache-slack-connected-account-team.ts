import { kv } from 'twenty-sdk/logic-function';

import { getSlackConnectedAccountTeamKvKey } from 'src/logic-functions/utils/get-slack-connected-account-team-kv-key';

export const cacheSlackConnectedAccountTeam = async (
  connectedAccountId: string,
  teamId: string,
): Promise<void> => {
  await kv.set(getSlackConnectedAccountTeamKvKey(connectedAccountId), teamId);
};
