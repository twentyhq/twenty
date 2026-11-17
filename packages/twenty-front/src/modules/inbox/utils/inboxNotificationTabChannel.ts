import { isDefined } from 'twenty-shared/utils';

import { isDocumentFocused } from '@/inbox/utils/isDocumentFocused';

const INBOX_NOTIFICATION_TAB_CHANNEL_NAME = 'twenty-inbox-notification-tabs';
const FOCUSED_TAB_RESPONSE_TIMEOUT_MS = 200;

let sharedChannel: BroadcastChannel | null = null;

const getInboxNotificationTabChannel = (): BroadcastChannel | null => {
  if (isDefined(sharedChannel)) {
    return sharedChannel;
  }

  try {
    sharedChannel = new BroadcastChannel(INBOX_NOTIFICATION_TAB_CHANNEL_NAME);
  } catch {
    return null;
  }

  return sharedChannel;
};

export const answerFocusedTabRequestsFromOtherTabs = (): (() => void) => {
  const channel = getInboxNotificationTabChannel();

  if (!isDefined(channel)) {
    return () => {};
  }

  const handleMessage = (event: MessageEvent) => {
    if (event.data?.type === 'focused-tab-request' && isDocumentFocused()) {
      channel.postMessage({ type: 'focused-tab-response' });
    }
  };

  channel.addEventListener('message', handleMessage);

  return () => channel.removeEventListener('message', handleMessage);
};

export const isAnotherTabFocused = (): Promise<boolean> => {
  const channel = getInboxNotificationTabChannel();

  if (!isDefined(channel)) {
    return Promise.resolve(false);
  }

  return new Promise((resolve) => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type !== 'focused-tab-response') {
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
    channel.postMessage({ type: 'focused-tab-request' });
  });
};
