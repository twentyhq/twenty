import { isNonEmptyString } from '@sniptt/guards';
import { kv } from 'twenty-sdk/logic-function';

import { getSlackTeamKvKey } from 'src/logic-functions/utils/get-slack-team-kv-key';

export const findClaimedWorkspaceId = async (
  teamId: string,
): Promise<string | null> => {
  const claimedWorkspaceId = await kv.get<string>(getSlackTeamKvKey(teamId), {
    scope: 'SERVER',
  });

  return isNonEmptyString(claimedWorkspaceId) ? claimedWorkspaceId : null;
};
