import { type AgentChatThreadParticipant } from '@/ai/types/AgentChatThreadParticipant';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

// Null until loaded, since a thread without its row reads as unread
export const agentChatThreadParticipantsState = createAtomState<Record<
  string,
  AgentChatThreadParticipant
> | null>({
  key: 'ai/agentChatThreadParticipantsState',
  defaultValue: null,
});
