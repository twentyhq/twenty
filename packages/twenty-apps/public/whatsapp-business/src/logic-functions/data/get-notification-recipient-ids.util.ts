import { kv } from 'twenty-sdk/logic-function';

import { NOTIFICATION_RECIPIENTS_KV_KEY } from 'src/constants/notification-recipients.constant';

export const getNotificationRecipientIds = async (): Promise<string[]> =>
  (await kv.get<string[]>(NOTIFICATION_RECIPIENTS_KV_KEY)) ?? [];
