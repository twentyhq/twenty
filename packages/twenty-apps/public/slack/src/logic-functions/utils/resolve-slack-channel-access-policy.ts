import { type CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'twenty-sdk/utils';

import { SLACK_ACCESS_MODE } from 'src/logic-functions/constants/slack-access-mode';
import { SLACK_CHANNEL_RULE_MODE } from 'src/logic-functions/constants/slack-channel-rule-mode';
import { findSlackChannelRule } from 'src/logic-functions/data/find-slack-channel-rule';
import { type SlackChannelAccessPolicy } from 'src/logic-functions/types/slack-channel-access-policy.type';
import { type SlackChannelRule } from 'src/logic-functions/types/slack-channel-rule.type';
import { getSlackAccessMode } from 'src/logic-functions/utils/get-slack-access-mode';

const resolveWorkspacePolicy = async (): Promise<SlackChannelAccessPolicy> => ({
  status: 'ANSWER',
  accessMode: await getSlackAccessMode(),
  isChannelRule: false,
});

const toChannelRulePolicy = (
  rule: SlackChannelRule,
): SlackChannelAccessPolicy => {
  switch (rule.mode) {
    case SLACK_CHANNEL_RULE_MODE.SILENT:
      return { status: 'SILENT' };
    case SLACK_CHANNEL_RULE_MODE.LINKED_MEMBERS_ONLY:
      return {
        status: 'ANSWER',
        accessMode: SLACK_ACCESS_MODE.ONLY_LINKED_MEMBERS,
        isChannelRule: true,
      };
    case SLACK_CHANNEL_RULE_MODE.OPEN:
      return {
        status: 'ANSWER',
        accessMode: SLACK_ACCESS_MODE.ANYONE,
        isChannelRule: true,
      };
  }
};

export const resolveSlackChannelAccessPolicy = async ({
  client,
  slackChannelId,
  isDirectMessage,
}: {
  client: Pick<CoreApiClient, 'query'>;
  slackChannelId: string;
  isDirectMessage: boolean;
}): Promise<SlackChannelAccessPolicy> => {
  if (isDirectMessage) {
    return await resolveWorkspacePolicy();
  }

  let rule: SlackChannelRule | undefined;

  try {
    rule = await findSlackChannelRule(client, { slackChannelId });
  } catch {
    return { status: 'UNREADABLE' };
  }

  if (!isDefined(rule)) {
    return await resolveWorkspacePolicy();
  }

  return toChannelRulePolicy(rule);
};
