import { sendInboxMessage } from 'twenty-sdk/logic-function';

import { getNotificationRecipientIds } from 'src/logic-functions/data/get-notification-recipient-ids.util';

type SendInboxNotificationParams = {
  threadKey: string;
  idempotencyKey: string;
  title: string;
  text: string;
};

// alerts accompany a failure; a failing alert must never replace the error it reports
export const sendInboxNotification = async (
  params: SendInboxNotificationParams,
) => {
  try {
    const workspaceMemberIds = await getNotificationRecipientIds();

    if (workspaceMemberIds.length === 0) {
      return;
    }

    await sendInboxMessage({ ...params, workspaceMemberIds });
  } catch (error) {
    console.error(`Could not send the Messenger alert "${params.title}"`, error);
  }
};
