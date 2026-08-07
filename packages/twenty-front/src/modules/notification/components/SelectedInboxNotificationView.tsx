import { ExpandedAiChatHeader } from '@/ai/expanded-chat/components/ExpandedAiChatHeader';
import { NotificationDetail } from '@/notification/components/NotificationDetail';
import { SelectedInboxNotificationGoneEffect } from '@/notification/effect-components/SelectedInboxNotificationGoneEffect';
import { useInboxNotifications } from '@/notification/hooks/useInboxNotifications';

type SelectedInboxNotificationViewProps = {
  notificationId: string;
};

// Only mounted after a notification row was clicked, which guarantees the
// notification object metadata exists in this workspace.
export const SelectedInboxNotificationView = ({
  notificationId,
}: SelectedInboxNotificationViewProps) => {
  const { needsAttentionNotifications, updateNotifications } =
    useInboxNotifications();

  const selectedNotification = [
    ...needsAttentionNotifications,
    ...updateNotifications,
  ].find((notification) => notification.id === notificationId);

  return (
    <>
      <SelectedInboxNotificationGoneEffect notificationId={notificationId} />
      {selectedNotification && (
        <>
          <ExpandedAiChatHeader title={selectedNotification.title} />
          <NotificationDetail notification={selectedNotification} />
        </>
      )}
    </>
  );
};
