import { isString } from '@sniptt/guards';
import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import { kv } from 'twenty-sdk/logic-function';

import {
  NOTIFICATION_RECIPIENTS_KV_KEY,
  NOTIFICATION_RECIPIENTS_SET_ROUTE_PATH,
} from 'src/constants/notification-recipients.constant';
import { MESSENGER_LOGIC_FUNCTION_SET_NOTIFICATION_RECIPIENTS_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { currentUserCanManageApplications } from 'src/logic-functions/data/current-user-can-manage-applications.util';
import { type SettingsRouteResult } from 'src/logic-functions/types/settings-route-result.type';

const handler = async (
  params: RoutePayload<{ workspaceMemberIds?: unknown }>,
): Promise<SettingsRouteResult> => {
  const workspaceMemberIds = params.body?.workspaceMemberIds;

  if (
    !Array.isArray(workspaceMemberIds) ||
    !workspaceMemberIds.every(isString)
  ) {
    return {
      success: false,
      error: 'workspaceMemberIds must be an array of strings.',
    };
  }

  if (!(await currentUserCanManageApplications())) {
    return {
      success: false,
      error: 'Only members who can manage applications can change this setting.',
    };
  }

  await kv.set(NOTIFICATION_RECIPIENTS_KV_KEY, [
    ...new Set(workspaceMemberIds),
  ]);

  return { success: true };
};

export default defineLogicFunction({
  universalIdentifier:
    MESSENGER_LOGIC_FUNCTION_SET_NOTIFICATION_RECIPIENTS_UNIVERSAL_IDENTIFIER,
  name: 'set-notification-recipients',
  description:
    'Saves the workspace members who receive Messenger inbox notifications.',
  timeoutSeconds: 30,
  handler,
  httpRouteTriggerSettings: {
    path: NOTIFICATION_RECIPIENTS_SET_ROUTE_PATH,
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
