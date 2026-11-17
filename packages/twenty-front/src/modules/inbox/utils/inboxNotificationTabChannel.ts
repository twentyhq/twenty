import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { INBOX_NOTIFICATION_FOCUSED_TAB_TIMEOUT_MS } from '@/inbox/constants/InboxNotificationFocusedTabTimeoutMs';
import { INBOX_NOTIFICATION_TAB_CHANNEL_NAME } from '@/inbox/constants/InboxNotificationTabChannelName';
import { type InboxNotificationTabMessage } from '@/inbox/types/InboxNotificationTabMessage';
import { isDocumentFocused } from '@/inbox/utils/isDocumentFocused';

let sharedChannel: BroadcastChannel | null = null;

const getInboxNotificationTabChannel = (): BroadcastChannel | null => {
  if (isDefined(sharedChannel)) {
    return sharedChannel;
  }

  if (typeof BroadcastChannel === 'undefined') {
    return null;
  }

  sharedChannel = new BroadcastChannel(INBOX_NOTIFICATION_TAB_CHANNEL_NAME);

  return sharedChannel;
};

export const answerFocusedTabRequestsFromOtherTabs = (): (() => void) => {
  const channel = getInboxNotificationTabChannel();

  if (!isDefined(channel)) {
    return () => {};
  }

  const handleMessage = (event: MessageEvent<InboxNotificationTabMessage>) => {
    if (event.data?.type !== 'focused-tab-request' || !isDocumentFocused()) {
      return;
    }

    channel.postMessage({
      type: 'focused-tab-response',
      requestId: event.data.requestId,
    } satisfies InboxNotificationTabMessage);
  };

  channel.addEventListener('message', handleMessage);

  return () => channel.removeEventListener('message', handleMessage);
};

export const isAnotherTabFocused = (): Promise<boolean> => {
  const channel = getInboxNotificationTabChannel();

  if (!isDefined(channel)) {
    return Promise.resolve(false);
  }

  const requestId = v4();

  return new Promise((resolve) => {
    const handleMessage = (
      event: MessageEvent<InboxNotificationTabMessage>,
    ) => {
      if (
        event.data?.type !== 'focused-tab-response' ||
        event.data.requestId !== requestId
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
    }, INBOX_NOTIFICATION_FOCUSED_TAB_TIMEOUT_MS);

    channel.addEventListener('message', handleMessage);
    channel.postMessage({
      type: 'focused-tab-request',
      requestId,
    } satisfies InboxNotificationTabMessage);
  });
};
