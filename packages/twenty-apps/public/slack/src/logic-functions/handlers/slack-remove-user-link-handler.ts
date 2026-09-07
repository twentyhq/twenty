import { isNonEmptyString } from '@sniptt/guards';
import { CoreApiClient } from 'twenty-client-sdk/core';

import { type SlackRouteBody } from 'src/logic-functions/types/slack-route-body.type';
import { type SlackToolResult } from 'src/logic-functions/types/slack-tool-result.type';
import { destroySlackUserLink } from 'src/logic-functions/data/destroy-slack-user-link';
import { currentUserHasRolesPermission } from 'src/logic-functions/utils/current-user-has-roles-permission';
import { asRecord } from 'src/logic-functions/utils/as-record.util';
import { readOptionalString } from 'src/logic-functions/utils/read-optional-string.util';
import { toErrorMessage } from 'src/logic-functions/utils/to-error-message.util';

const readId = (payload: SlackRouteBody): string | undefined =>
  readOptionalString(asRecord(payload.body)?.id);

export const slackRemoveUserLinkHandler = async (
  payload: SlackRouteBody,
): Promise<SlackToolResult> => {
  const id = readId(payload);

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
      error:
        'Only members with the roles permission can remove Slack user links.',
    };
  }

  try {
    await destroySlackUserLink(new CoreApiClient({ runAs: 'application' }), {
      id,
    });
  } catch (error) {
    return {
      success: false,
      message: 'Could not remove the link',
      error: toErrorMessage(error),
    };
  }

  return { success: true, message: 'Removed the Slack user link.' };
};
