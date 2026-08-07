import { useEffect } from 'react';

import { ExpandedAiChatHeader } from '@/ai/expanded-chat/components/ExpandedAiChatHeader';
import { selectedInboxNotificationIdState } from '@/ai/expanded-chat/states/selectedInboxNotificationIdState';
import { NotificationDetail } from '@/notification/components/NotificationDetail';
import { useInboxNotifications } from '@/notification/hooks/useInboxNotifications';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

type SelectedInboxNotificationViewProps = {
  notificationId: string;
};

// Only mounted after a notification row was clicked, which guarantees the
// notification object metadata exists in this workspace.
export const SelectedInboxNotificationView = ({
  notificationId,
}: SelectedInboxNotificationViewProps) => {
  const { needsAttentionNotifications, updateNotifications, loading } =
    useInboxNotifications();
  const setSelectedInboxNotificationId = useSetAtomState(
    selectedInboxNotificationIdState,
  );

  const selectedNotification = [
    ...needsAttentionNotifications,
    ...updateNotifications,
  ].find((notification) => notification.id === notificationId);

  const isSelectionGone = !loading && !selectedNotification;

  // The selected item can be resolved elsewhere (done on another device,
  // aged out of the list); dropping the selection returns to the chat
  // instead of a stuck empty panel.
  useEffect(() => {
    if (isSelectionGone) {
      setSelectedInboxNotificationId(null);
    }
  }, [isSelectionGone, setSelectedInboxNotificationId]);

  if (!selectedNotification) {
    return null;
  }

  return (
    <>
      <ExpandedAiChatHeader title={selectedNotification.title} />
      <NotificationDetail notification={selectedNotification} />
    </>
  );
};
