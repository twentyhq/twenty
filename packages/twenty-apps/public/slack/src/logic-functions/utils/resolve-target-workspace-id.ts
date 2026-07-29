import { isNonEmptyString } from '@sniptt/guards';
import { kv } from 'twenty-sdk/logic-function';

import { type SlackEventsRequestBody } from 'src/logic-functions/types/slack-events-request-body.type';
import { getSlackTeamKvKey } from 'src/logic-functions/utils/get-slack-team-kv-key';

export const resolveTargetWorkspaceId = async (
  body: SlackEventsRequestBody,
): Promise<string> => {
  const teamId = body.team_id;

  if (!isNonEmptyString(teamId)) {
    throw new Error(
      'Slack event has no team_id; cannot resolve the target workspace',
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
