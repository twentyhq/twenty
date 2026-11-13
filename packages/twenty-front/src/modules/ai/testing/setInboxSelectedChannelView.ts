import { type createStore } from 'jotai';
import { isDefined } from 'twenty-shared/utils';

import { INBOX_DEFAULT_SELECTED_THREAD_LIST_SOURCE } from '@/ai/constants/InboxDefaultSelectedThreadListSource';
import { inboxSelectedThreadListSourceState } from '@/ai/states/inboxSelectedThreadListSourceState';
import { type InboxChannelView } from '@/ai/types/InboxChannelView';

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
