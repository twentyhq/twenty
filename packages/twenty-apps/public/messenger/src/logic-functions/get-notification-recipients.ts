import { defineLogicFunction } from 'twenty-sdk/define';

import { NOTIFICATION_RECIPIENTS_GET_ROUTE_PATH } from 'src/constants/notification-recipients.constant';
import { MESSENGER_LOGIC_FUNCTION_GET_NOTIFICATION_RECIPIENTS_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { currentUserCanManageApplications } from 'src/logic-functions/data/current-user-can-manage-applications.util';
import { getNotificationRecipientIds } from 'src/logic-functions/data/get-notification-recipient-ids.util';
import { type GetNotificationRecipientsResult } from 'src/logic-functions/types/notification-recipients.type';

const handler = async (): Promise<GetNotificationRecipientsResult> => {
  const [workspaceMemberIds, canEdit] = await Promise.all([
    getNotificationRecipientIds(),
    currentUserCanManageApplications(),
  ]);

  return { workspaceMemberIds, canEdit };
};

export default defineLogicFunction({
  universalIdentifier:
    MESSENGER_LOGIC_FUNCTION_GET_NOTIFICATION_RECIPIENTS_UNIVERSAL_IDENTIFIER,
  name: 'get-notification-recipients',
  description:
    'Returns the workspace members who receive Messenger inbox notifications.',
  timeoutSeconds: 30,
  handler,
  httpRouteTriggerSettings: {
    path: NOTIFICATION_RECIPIENTS_GET_ROUTE_PATH,
    httpMethod: 'GET',
    isAuthRequired: true,
  },
});
