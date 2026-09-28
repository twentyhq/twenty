import { isNonEmptyString } from '@sniptt/guards';
import { CoreApiClient } from 'twenty-client-sdk/core';

import { destroySlackChannelRule } from 'src/logic-functions/data/destroy-slack-channel-rule';
import { type SlackRouteBody } from 'src/logic-functions/types/slack-route-body.type';
import { type SlackToolResult } from 'src/logic-functions/types/slack-tool-result.type';
import { asRecord } from 'src/logic-functions/utils/as-record.util';
import { currentUserHasRolesPermission } from 'src/logic-functions/utils/current-user-has-roles-permission';
import { readOptionalString } from 'src/logic-functions/utils/read-optional-string.util';
import { toErrorMessage } from 'src/logic-functions/utils/to-error-message.util';

export const slackRemoveChannelRuleHandler = async (
  payload: SlackRouteBody,
): Promise<SlackToolResult> => {
  const id = readOptionalString(asRecord(payload.body)?.id);

  if (!isNonEmptyString(id)) {
    return {
      success: false,
      message: 'Missing required fields',
      error: 'id is required.',
    };
  }

  const isAllowed = await currentUserHasRolesPermission();

  if (!isAllowed) {
    return {
      success: false,
      message: 'Not allowed',
      error: 'Only members with the roles permission can remove channel rules.',
    };
  }

  try {
    await destroySlackChannelRule(new CoreApiClient({ runAs: 'application' }), {
      id,
    });
  } catch (error) {
    return {
      success: false,
      message: 'Could not remove the rule',
      error: toErrorMessage(error),
    };
  }

  return {
    success: true,
    message:
      'Removed the channel rule. The channel now follows the workspace access mode.',
  };
};
