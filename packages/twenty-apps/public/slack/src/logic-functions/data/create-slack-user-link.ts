import { isNonEmptyString } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { type SlackUserLinkDraft } from 'src/logic-functions/types/slack-user-link-draft.type';

export const createSlackUserLink = async (
  client: CoreApiClient,
  draft: SlackUserLinkDraft,
): Promise<string> => {
  const result = await client.mutation({
    createSlackUserLink: {
      __args: { data: draft },
      id: true,
    },
  });

  const createdId = result.createSlackUserLink?.id;

  if (!isNonEmptyString(createdId)) {
    throw new Error('Slack user link creation returned no id');
  }

  return createdId;
};
