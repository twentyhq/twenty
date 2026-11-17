import { type INBOX_NOTIFICATION_LEVEL } from '@/inbox/constants/InboxNotificationLevel';

export type InboxNotificationLevel =
  (typeof INBOX_NOTIFICATION_LEVEL)[keyof typeof INBOX_NOTIFICATION_LEVEL];
