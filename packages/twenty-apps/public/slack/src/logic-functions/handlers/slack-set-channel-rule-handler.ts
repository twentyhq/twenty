import { type ConversationsInfoResponse } from '@slack/web-api';
import { isNonEmptyString } from '@sniptt/guards';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'twenty-sdk/utils';

import { SLACK_CHANNEL_RULE_MODE } from 'src/logic-functions/constants/slack-channel-rule-mode';
import { createSlackChannelRule } from 'src/logic-functions/data/create-slack-channel-rule';
import { findSlackChannelRule } from 'src/logic-functions/data/find-slack-channel-rule';
import { updateSlackChannelRule } from 'src/logic-functions/data/update-slack-channel-rule';
import { type SlackChannelRule } from 'src/logic-functions/types/slack-channel-rule.type';
import { type SlackChannelRuleMode } from 'src/logic-functions/types/slack-channel-rule-mode.type';
import { type SlackRouteBody } from 'src/logic-functions/types/slack-route-body.type';
import { type SlackToolResult } from 'src/logic-functions/types/slack-tool-result.type';
import { asRecord } from 'src/logic-functions/utils/as-record.util';
import { currentUserHasRolesPermission } from 'src/logic-functions/utils/current-user-has-roles-permission';
import { getInstalledSlackTeamId } from 'src/logic-functions/utils/get-installed-slack-team-id';
import { getSlackClient } from 'src/logic-functions/utils/get-slack-client';
import { isSlackChannelRuleMode } from 'src/logic-functions/utils/is-slack-channel-rule-mode';
import { readOptionalString } from 'src/logic-functions/utils/read-optional-string.util';
import { toErrorMessage } from 'src/logic-functions/utils/to-error-message.util';

const MODE_SAVED_NOTES: Record<SlackChannelRuleMode, string> = {
  [SLACK_CHANNEL_RULE_MODE.OPEN]:
    'The assistant answers anyone there, whatever the workspace access mode.',
  [SLACK_CHANNEL_RULE_MODE.LINKED_MEMBERS_ONLY]:
    'The assistant only answers Slack accounts linked to a workspace member there.',
  [SLACK_CHANNEL_RULE_MODE.SILENT]:
    'The assistant ignores that channel entirely.',
};

const describeChannel = ({
  name,
  slackChannelId,
}: {
  name: string | undefined;
  slackChannelId: string;
}): string => (isNonEmptyString(name) ? `#${name}` : slackChannelId);

export const slackSetChannelRuleHandler = async (
  payload: SlackRouteBody,
): Promise<SlackToolResult> => {
  const body = asRecord(payload.body) ?? {};
  const slackChannelId = readOptionalString(body.slackChannelId)?.trim();
  const requestedName = readOptionalString(body.name)?.trim();

  if (!isNonEmptyString(slackChannelId)) {
    return {
      success: false,
      message: 'Missing required fields',
      error: 'slackChannelId is required.',
    };
  }

  if (!isSlackChannelRuleMode(body.mode)) {
    return {
      success: false,
      message: 'Invalid mode',
      error: 'mode must be OPEN, LINKED_MEMBERS_ONLY or SILENT.',
    };
  }

  const mode = body.mode;

  const isAllowed = await currentUserHasRolesPermission();

  if (!isAllowed) {
    return {
      success: false,
      message: 'Not allowed',
      error: 'Only members with the roles permission can set channel rules.',
    };
  }

  const slackClientResult = await getSlackClient();

  if (!slackClientResult.success) {
    return {
      success: false,
      message: 'Slack is not connected',
      error: slackClientResult.error,
    };
  }

  const slackClient = slackClientResult.client;

  let channelInfo: ConversationsInfoResponse;

  try {
    channelInfo = await slackClient.conversations.info({
      channel: slackChannelId,
    });
  } catch (error) {
    return {
      success: false,
      message: 'Could not confirm the channel with Slack',
      error: toErrorMessage(error),
    };
  }

  const channel = channelInfo.channel;

  if (!isDefined(channel)) {
    return {
      success: false,
      message: 'Slack channel not found',
      error: `Slack did not return a channel with id ${slackChannelId}. Check that the app can see it and try again.`,
    };
  }

  if (channel.is_im === true || channel.is_mpim === true) {
    return {
      success: false,
      message: 'Not a channel',
      error: 'Rules apply to channels only, not to direct messages.',
    };
  }

  const installedTeamId = await getInstalledSlackTeamId({
    slackClient,
    slackConnectionId: slackClientResult.connectionId,
  });
  const slackTeamId =
    readOptionalString(channel.context_team_id) ?? installedTeamId;

  if (!isNonEmptyString(slackTeamId)) {
    return {
      success: false,
      message: 'Could not verify the installed Slack workspace',
      error: 'Slack did not confirm the installed workspace. Please try again.',
    };
  }

  const name = readOptionalString(channel.name) ?? requestedName;

  const client = new CoreApiClient({ runAs: 'application' });

  let existingRule: SlackChannelRule | undefined;

  try {
    existingRule = await findSlackChannelRule(client, { slackChannelId });
  } catch (error) {
    return {
      success: false,
      message: 'Could not look up the existing rule',
      error: toErrorMessage(error),
    };
  }

  try {
    if (isDefined(existingRule)) {
      await updateSlackChannelRule(client, {
        id: existingRule.id,
        name,
        slackTeamId,
        mode,
      });
    } else {
      await createSlackChannelRule(client, {
        name: name ?? slackChannelId,
        slackChannelId,
        slackTeamId,
        mode,
      });
    }
  } catch (error) {
    return {
      success: false,
      message: 'Could not save the rule',
      error: toErrorMessage(error),
    };
  }

  return {
    success: true,
    message: `Saved the rule for ${describeChannel({ name, slackChannelId })}. ${MODE_SAVED_NOTES[mode]}`,
  };
};
