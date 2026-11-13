import { type AgentChatThreadPresetFilter } from 'twenty-shared/ai';

import { type InboxChannelView } from '@/ai/types/InboxChannelView';

export type InboxThreadListSource =
  | { type: 'recent' }
  | { type: 'presetFilter'; presetFilter: AgentChatThreadPresetFilter }
  | { type: 'channel'; channelView: InboxChannelView };
