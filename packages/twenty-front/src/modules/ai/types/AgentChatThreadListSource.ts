import { type AgentChatThreadFilterStatus } from 'twenty-shared/ai';

import { type AgentChatChannelView } from '@/ai/types/AgentChatChannelView';

export type AgentChatThreadListSource =
  | { type: 'recent' }
  | { type: 'presetFilter'; presetFilter: AgentChatThreadFilterStatus }
  | { type: 'channel'; channelView: AgentChatChannelView };
