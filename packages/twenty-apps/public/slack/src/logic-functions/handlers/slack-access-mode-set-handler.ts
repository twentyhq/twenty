import { type RoutePayload } from 'twenty-sdk/define';
import { kv } from 'twenty-sdk/logic-function';

import {
  SLACK_ACCESS_MODE,
  SLACK_ACCESS_MODE_KV_KEY,
  type SlackAccessMode,
} from 'src/logic-functions/constants/slack-access-mode';
import { asRecord } from 'src/logic-functions/utils/as-record.util';
import { currentUserHasRolesPermission } from 'src/logic-functions/utils/current-user-has-roles-permission';

type SlackAccessModeSetResult = {
  success: boolean;
  accessMode?: SlackAccessMode;
  message: string;
  error?: string;
};

const isSlackAccessMode = (value: unknown): value is SlackAccessMode =>
  value === SLACK_ACCESS_MODE.ANYONE ||
  value === SLACK_ACCESS_MODE.ONLY_LINKED_MEMBERS;

export const slackAccessModeSetHandler = async (
  payload: RoutePayload,
): Promise<SlackAccessModeSetResult> => {
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
    accessMode,
    message:
      accessMode === SLACK_ACCESS_MODE.ONLY_LINKED_MEMBERS
        ? 'The assistant is now restricted to linked members.'
        : 'The assistant is now open to anyone.',
  };
};
