import { useEffect } from 'react';

import { selectedInboxNotificationIdState } from '@/ai/expanded-chat/states/selectedInboxNotificationIdState';
import { useInboxNotifications } from '@/notification/hooks/useInboxNotifications';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

type SelectedInboxNotificationGoneEffectProps = {
  notificationId: string;
};

// The selected item can be resolved elsewhere (done on another device,
// aged out of the list); dropping the selection returns to the chat
// instead of a stuck empty panel.
export const SelectedInboxNotificationGoneEffect = ({
  notificationId,
}: SelectedInboxNotificationGoneEffectProps) => {
  const { needsAttentionNotifications, updateNotifications, loading } =
    useInboxNotifications();
  const setSelectedInboxNotificationId = useSetAtomState(
    selectedInboxNotificationIdState,
  );

  const isSelectionGone =
    !loading &&
    ![...needsAttentionNotifications, ...updateNotifications].some(
      (notification) => notification.id === notificationId,
    );

  useEffect(() => {
    if (isSelectionGone) {
      setSelectedInboxNotificationId(null);
    }
  }, [isSelectionGone, setSelectedInboxNotificationId]);

  return null;
};
