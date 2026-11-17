import { INBOX_NOTIFICATION_ACTIVITY_WINDOW_MS } from '@/inbox/constants/InboxNotificationActivityWindowMs';

export const isWithinInboxNotificationActivityWindow = ({
  timestamp,
  lastActivityAt,
}: {
  timestamp: string;
  lastActivityAt: string;
}): boolean =>
  Math.abs(
    new Date(timestamp).getTime() - new Date(lastActivityAt).getTime(),
  ) <= INBOX_NOTIFICATION_ACTIVITY_WINDOW_MS;
