import { sendInboxMessage } from 'twenty-sdk/logic-function';

import { getNotificationRecipientIds } from 'src/logic-functions/data/get-notification-recipient-ids.util';

type SendInboxNotificationParams = {
  threadKey: string;
  idempotencyKey: string;
  title: string;
  text: string;
};

export const sendInboxNotification = async (
  params: SendInboxNotificationParams,
) => {
  const workspaceMemberIds = await getNotificationRecipientIds();

  if (workspaceMemberIds.length === 0) {
    return;
  }

  await sendInboxMessage({ ...params, workspaceMemberIds });
};
