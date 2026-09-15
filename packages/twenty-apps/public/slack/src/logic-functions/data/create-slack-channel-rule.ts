import { isNonEmptyString } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { type SlackChannelRuleDraft } from 'src/logic-functions/types/slack-channel-rule-draft.type';

export const createSlackChannelRule = async (
  client: Pick<CoreApiClient, 'mutation'>,
  draft: SlackChannelRuleDraft,
): Promise<string> => {
  const result = await client.mutation({
    createSlackChannelRule: {
      __args: { data: draft },
      id: true,
    },
  });

  const createdId = result.createSlackChannelRule?.id;

  if (!isNonEmptyString(createdId)) {
    throw new Error('Slack channel rule creation returned no id');
  }

  return createdId;
};
