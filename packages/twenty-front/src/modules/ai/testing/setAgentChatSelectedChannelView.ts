import { type createStore } from 'jotai';
import { isDefined } from 'twenty-shared/utils';

import { AGENT_CHAT_DEFAULT_SELECTED_THREAD_LIST_SOURCE } from '@/ai/constants/AgentChatDefaultSelectedThreadListSource';
import { agentChatSelectedThreadListSourceState } from '@/ai/states/agentChatSelectedThreadListSourceState';
import { type AgentChatChannelView } from '@/ai/types/AgentChatChannelView';

export const setAgentChatSelectedChannelView = (
  store: ReturnType<typeof createStore>,
  channelView: AgentChatChannelView | null,
) => {
  store.set(
    agentChatSelectedThreadListSourceState.atom,
    isDefined(channelView)
      ? { type: 'channel', channelView }
      : AGENT_CHAT_DEFAULT_SELECTED_THREAD_LIST_SOURCE,
  );
};
