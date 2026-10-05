import { kv } from 'twenty-sdk/logic-function';

import { SLACK_ACCESS_MODE } from 'src/logic-functions/constants/slack-access-mode';
import { SLACK_ACCESS_MODE_KV_KEY } from 'src/logic-functions/constants/slack-access-mode-kv-key';
import { type SlackRouteBody } from 'src/logic-functions/types/slack-route-body.type';
import { type SlackToolResult } from 'src/logic-functions/types/slack-tool-result.type';
import { asRecord } from 'src/logic-functions/utils/as-record.util';
import { currentUserHasRolesPermission } from 'src/logic-functions/utils/current-user-has-roles-permission';
import { isSlackAccessMode } from 'src/logic-functions/utils/is-slack-access-mode';

export const slackAccessModeSetHandler = async (
  payload: SlackRouteBody,
): Promise<SlackToolResult> => {
  const isAllowed = await currentUserHasRolesPermission();

  if (!isAllowed) {
    return {
      success: false,
      message: 'Not allowed',
      error:
        'Only members with the roles permission can change the access mode.',
    };
  }

  const body = asRecord(payload.body) ?? {};

  if (!isSlackAccessMode(body.accessMode)) {
    return {
      success: false,
      message: 'Invalid access mode',
      error: 'accessMode must be ANYONE or ONLY_LINKED_MEMBERS.',
    };
  }

  const accessMode = body.accessMode;

  try {
    await kv.set(SLACK_ACCESS_MODE_KV_KEY, accessMode, { scope: 'WORKSPACE' });
  } catch (error) {
    return {
      success: false,
      message: 'Could not save the access mode',
      error: error instanceof Error ? error.message : String(error),
    };
  }

  return {
    success: true,
    message:
      accessMode === SLACK_ACCESS_MODE.ONLY_LINKED_MEMBERS
        ? 'The assistant is now restricted to linked members.'
        : 'The assistant is now open to anyone.',
  };
};
