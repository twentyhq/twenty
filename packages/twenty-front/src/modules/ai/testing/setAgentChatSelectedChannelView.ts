import { type createStore } from 'jotai';
import { isDefined } from 'twenty-shared/utils';

import { INBOX_DEFAULT_SELECTED_THREAD_LIST_SOURCE } from '@/ai/constants/AgentChatDefaultSelectedThreadListSource';
import { inboxSelectedThreadListSourceState } from '@/ai/states/agentChatSelectedThreadListSourceState';
import { type InboxChannelView } from '@/ai/types/AgentChatChannelView';

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
