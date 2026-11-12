import { type AgentChatThreadFilterStatus } from 'twenty-shared/ai';

import { type AgentChatChannelView } from '@/ai/types/AgentChatChannelView';

export type AgentChatThreadListSource =
  | { type: 'recent' }
  | { type: 'presetFilter'; filterStatus: AgentChatThreadFilterStatus }
  | { type: 'channel'; channelView: AgentChatChannelView };
