import { assertIsDefinedOrThrow } from 'twenty-shared/utils';

import { INBOX_CHANNEL_NAVIGATION_ITEMS } from '@/inbox/constants/InboxChannelNavigationItems';
import { type InboxChannelView } from '@/inbox/types/InboxChannelView';

export const getInboxChannelNavigationItemOrThrow = (
  channelView: Pick<InboxChannelView, 'channelStatus'>,
) => {
  const navigationItem = INBOX_CHANNEL_NAVIGATION_ITEMS.find(
    ({ channelStatus }) => channelStatus === channelView.channelStatus,
  );

  assertIsDefinedOrThrow(navigationItem);

  return navigationItem;
};
