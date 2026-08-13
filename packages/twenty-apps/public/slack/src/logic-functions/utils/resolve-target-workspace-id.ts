import { isNonEmptyString } from '@sniptt/guards';

import { type SlackEventsRequestBody } from 'src/logic-functions/types/slack-events-request-body.type';
import { findClaimedWorkspaceId } from 'src/logic-functions/utils/find-claimed-workspace-id';

export const resolveTargetWorkspaceId = async (
  body: SlackEventsRequestBody,
): Promise<string> => {
  const teamId = body.team_id;

  if (!isNonEmptyString(teamId)) {
    throw new Error(
      'Slack event has no team_id; cannot resolve the target workspace',
    );
  }

  const claimedWorkspaceId = await findClaimedWorkspaceId(teamId);

  if (claimedWorkspaceId === null) {
    throw new Error(
      `No workspace has claimed Slack team ${teamId}. Connect the Slack app in the target workspace first.`,
    );
  }

  return claimedWorkspaceId;
};
