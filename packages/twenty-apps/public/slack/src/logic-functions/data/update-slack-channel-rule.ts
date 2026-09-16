import { isNonEmptyString } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'twenty-sdk/utils';

import { type SlackChannelRuleCapability } from 'src/logic-functions/types/slack-channel-rule-capability.type';
import { type SlackChannelRuleMode } from 'src/logic-functions/types/slack-channel-rule-mode.type';

export const updateSlackChannelRule = async (
  client: Pick<CoreApiClient, 'mutation'>,
  {
    id,
    name,
    slackTeamId,
    mode,
    capability,
  }: {
    id: string;
    name?: string;
    slackTeamId?: string;
    mode?: SlackChannelRuleMode;
    capability?: SlackChannelRuleCapability;
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
          ...(isDefined(capability) ? { capability } : {}),
        },
      },
      id: true,
    },
  });
};
