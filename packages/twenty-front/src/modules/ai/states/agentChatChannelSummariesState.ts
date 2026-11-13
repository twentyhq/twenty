import { type AgentChatChannelSummary } from '@/ai/types/AgentChatChannelSummary';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

// Counted by the server, as the client only loads some of a channel's chats
export const inboxChannelSummariesState = createAtomState<
  Record<string, AgentChatChannelSummary>
>({
  key: 'inboxChannelSummariesState',
  defaultValue: {},
});
