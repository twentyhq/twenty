import { MetadataApiClient } from 'twenty-client-sdk/metadata';
import { isNonEmptyString } from '@sniptt/guards';

import { type SlackEventsRequestBody } from 'src/logic-functions/types/slack-event.type';

export const resolveTargetWorkspaceId = async (
  _body: SlackEventsRequestBody,
): Promise<string> => {
  const client = new MetadataApiClient();

  const result = await client.query({
    currentWorkspace: { id: true },
  });

  const workspaceId = result.currentWorkspace?.id;

  if (!isNonEmptyString(workspaceId)) {
    throw new Error(
      'Could not resolve the owner workspace for the Slack events route',
    );
  }

  return workspaceId;
};
