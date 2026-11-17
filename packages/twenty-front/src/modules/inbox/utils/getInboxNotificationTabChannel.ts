import { isDefined } from 'twenty-shared/utils';

import { INBOX_NOTIFICATION_TAB_CHANNEL_NAME } from '@/inbox/constants/InboxNotificationTabChannelName';

let sharedChannel: BroadcastChannel | null = null;

export const getInboxNotificationTabChannel = (): BroadcastChannel => {
  if (!isDefined(sharedChannel)) {
    sharedChannel = new BroadcastChannel(INBOX_NOTIFICATION_TAB_CHANNEL_NAME);
  }

  return sharedChannel;
};
