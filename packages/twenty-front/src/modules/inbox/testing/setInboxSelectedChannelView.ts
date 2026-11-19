import { type createStore } from 'jotai';
import { isDefined } from 'twenty-shared/utils';

import { INBOX_DEFAULT_SELECTED_THREAD_LIST_SOURCE } from '@/inbox/constants/InboxDefaultSelectedThreadListSource';
import { inboxSelectedThreadListSourceState } from '@/inbox/states/inboxSelectedThreadListSourceState';
import { type InboxChannelView } from '@/inbox/types/InboxChannelView';

export const setInboxSelectedChannelView = (
  store: ReturnType<typeof createStore>,
  channelView: InboxChannelView | null,
) => {
  store.set(
    inboxSelectedThreadListSourceState.atom,
    isDefined(channelView)
      ? { type: 'channel', channelView }
      : INBOX_DEFAULT_SELECTED_THREAD_LIST_SOURCE,
  );
};
