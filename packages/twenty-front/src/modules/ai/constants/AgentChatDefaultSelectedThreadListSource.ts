import { AGENT_CHAT_THREAD_PRESET_FILTER } from 'twenty-shared/ai';

import { type AgentChatSelectedThreadListSource } from '@/ai/types/AgentChatSelectedThreadListSource';

export const AGENT_CHAT_DEFAULT_SELECTED_THREAD_LIST_SOURCE: AgentChatSelectedThreadListSource =
  {
    type: 'presetFilter',
    presetFilter: AGENT_CHAT_THREAD_PRESET_FILTER.OPEN,
  };
