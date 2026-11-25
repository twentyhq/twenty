import { type AgentChatThreadPresetFilter } from 'twenty-shared/ai';

export type NavigationMenuTabEntry =
  | { type: 'link'; link: string }
  | { type: 'inboxPresetFilter'; presetFilter: AgentChatThreadPresetFilter }
  | { type: 'inboxChannel'; channelId: string }
  | { type: 'aiChatThread'; threadId: string };
