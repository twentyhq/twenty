import { isNonEmptyString } from '@sniptt/guards';
import { MetadataApiClient } from 'twenty-client-sdk/metadata';
import { kv } from 'twenty-sdk/logic-function';

import { type SlackEventsRequestBody } from 'src/logic-functions/types/slack-event.type';
import { getSlackTeamKvKey } from 'src/logic-functions/utils/get-slack-team-kv-key';

const getInstanceWorkspaceId = async (): Promise<string> => {
  const client = new MetadataApiClient();

  const result = await client.query({
    currentWorkspace: { id: true },
  });

  const workspaceId = result.currentWorkspace?.id;

  if (!isNonEmptyString(workspaceId)) {
    throw new Error(
      'Could not resolve the instance workspace for the Slack events route',
    );
  }

  return workspaceId;
};

export const resolveTargetWorkspaceId = async (
  body: SlackEventsRequestBody,
): Promise<string> => {
  const teamId = body.team_id;

  if (!isNonEmptyString(teamId)) {
    return getInstanceWorkspaceId();
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
