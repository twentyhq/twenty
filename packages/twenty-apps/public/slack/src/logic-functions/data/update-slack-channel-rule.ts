import { isNonEmptyString } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'twenty-sdk/utils';

import { type SlackChannelRuleMode } from 'src/logic-functions/types/slack-channel-rule-mode.type';

export const updateSlackChannelRule = async (
  client: CoreApiClient,
  {
    id,
    name,
    slackTeamId,
    mode,
  }: {
    id: string;
    name?: string;
    slackTeamId?: string;
    mode?: SlackChannelRuleMode;
  },
): Promise<void> => {
  await client.mutation({
    updateSlackChannelRule: {
      __args: {
        id,
        data: {
          ...(isNonEmptyString(name) ? { name } : {}),
          ...(isNonEmptyString(slackTeamId) ? { slackTeamId } : {}),
          ...(isDefined(mode) ? { mode } : {}),
        },
      },
      id: true,
    },
  });
};
