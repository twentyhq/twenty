import { type AgentChatChannelSummary } from '@/ai/types/AgentChatChannelSummary';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

// Counted by the server, which reads every chat of a channel where the
// client only loads some
export const agentChatChannelSummariesState = createAtomState<
  Record<string, AgentChatChannelSummary>
>({
  key: 'agentChatChannelSummariesState',
  defaultValue: {},
});
