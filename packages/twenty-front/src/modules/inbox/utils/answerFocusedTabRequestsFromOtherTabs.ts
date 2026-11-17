import { INBOX_NOTIFICATION_TAB_MESSAGE_TYPE } from '@/inbox/constants/InboxNotificationTabMessageType';
import { getInboxNotificationTabChannel } from '@/inbox/utils/getInboxNotificationTabChannel';
import { isDocumentFocused } from '@/inbox/utils/isDocumentFocused';

export const answerFocusedTabRequestsFromOtherTabs = (): (() => void) => {
  const channel = getInboxNotificationTabChannel();

  const handleMessage = (event: MessageEvent) => {
    if (
      event.data?.type ===
        INBOX_NOTIFICATION_TAB_MESSAGE_TYPE.FOCUSED_TAB_REQUEST &&
      isDocumentFocused()
    ) {
      channel.postMessage({
        type: INBOX_NOTIFICATION_TAB_MESSAGE_TYPE.FOCUSED_TAB_RESPONSE,
      });
    }
  };

  channel.addEventListener('message', handleMessage);

  return () => channel.removeEventListener('message', handleMessage);
};
