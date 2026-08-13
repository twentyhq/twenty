import { isNonEmptyString } from '@sniptt/guards';
import { kv } from 'twenty-sdk/logic-function';

import { getSlackTeamKvKey } from 'src/logic-functions/utils/get-slack-team-kv-key';

export const resolveTargetWorkspaceId = async (
  teamId: string | undefined,
): Promise<string> => {
  if (!isNonEmptyString(teamId)) {
    throw new Error(
      'Slack request has no team id; cannot resolve the target workspace',
    );
  }

  const claimedWorkspaceId = await kv.get<string>(getSlackTeamKvKey(teamId), {
    scope: 'SERVER',
  });

  if (!isNonEmptyString(claimedWorkspaceId)) {
    throw new Error(
      `No workspace has claimed Slack team ${teamId}. Connect the Slack app in the target workspace first.`,
    );
  }

  return claimedWorkspaceId;
};
