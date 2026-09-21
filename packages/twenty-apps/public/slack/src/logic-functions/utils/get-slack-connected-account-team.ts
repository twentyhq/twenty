import { kv } from 'twenty-sdk/logic-function';

import { getSlackConnectedAccountTeamKvKey } from 'src/logic-functions/utils/get-slack-connected-account-team-kv-key';

export const getSlackConnectedAccountTeam = async (
  connectedAccountId: string,
): Promise<string | null> =>
  kv.get<string>(getSlackConnectedAccountTeamKvKey(connectedAccountId));
