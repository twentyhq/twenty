import { isNonEmptyString } from '@sniptt/guards';
import { type RoutePayload } from 'twenty-sdk/define';
import { CoreApiClient } from 'twenty-client-sdk/core';

import { type SlackToolResult } from 'src/logic-functions/types/slack-tool-result.type';
import { deleteSlackUserLink } from 'src/logic-functions/data/delete-slack-user-link';
import { currentUserHasWorkspaceMembersPermission } from 'src/logic-functions/utils/current-user-has-workspace-members-permission';
import { asRecord } from 'src/logic-functions/utils/as-record.util';
import { readOptionalString } from 'src/logic-functions/utils/read-optional-string.util';

type SlackRouteBody = Pick<RoutePayload<unknown>, 'body'>;

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

  const isAllowed = await currentUserHasWorkspaceMembersPermission();

  if (!isAllowed) {
    return {
      success: false,
      message: 'Not allowed',
      error:
        'Only members with the workspace members permission can remove Slack user links.',
    };
  }

  try {
    await deleteSlackUserLink(new CoreApiClient({ runAs: 'application' }), {
      id,
    });
  } catch (error) {
    return {
      success: false,
      message: 'Could not remove the link',
      error: error instanceof Error ? error.message : String(error),
    };
  }

  return { success: true, message: 'Removed the Slack user link.' };
};
