import { type AgentChatThreadPresetFilter } from 'twenty-shared/ai';

import { type AgentChatChannelView } from '@/ai/types/AgentChatChannelView';

export type AgentChatThreadListSource =
  | { type: 'recent' }
  | { type: 'presetFilter'; presetFilter: AgentChatThreadPresetFilter }
  | { type: 'channel'; channelView: AgentChatChannelView };
