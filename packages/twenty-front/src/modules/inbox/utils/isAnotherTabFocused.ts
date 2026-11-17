import { INBOX_NOTIFICATION_TAB_MESSAGE_TYPE } from '@/inbox/constants/InboxNotificationTabMessageType';
import { getInboxNotificationTabChannel } from '@/inbox/utils/getInboxNotificationTabChannel';

const FOCUSED_TAB_RESPONSE_TIMEOUT_MS = 200;

export const isAnotherTabFocused = (): Promise<boolean> => {
  const channel = getInboxNotificationTabChannel();

  return new Promise((resolve) => {
    const handleMessage = (event: MessageEvent) => {
      if (
        event.data?.type !==
        INBOX_NOTIFICATION_TAB_MESSAGE_TYPE.FOCUSED_TAB_RESPONSE
      ) {
        return;
      }

      clearTimeout(timeoutId);
      channel.removeEventListener('message', handleMessage);
      resolve(true);
    };

    const timeoutId = setTimeout(() => {
      channel.removeEventListener('message', handleMessage);
      resolve(false);
    }, FOCUSED_TAB_RESPONSE_TIMEOUT_MS);

    channel.addEventListener('message', handleMessage);
    channel.postMessage({
      type: INBOX_NOTIFICATION_TAB_MESSAGE_TYPE.FOCUSED_TAB_REQUEST,
    });
  });
};
