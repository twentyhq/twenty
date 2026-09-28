import { type AgentChatThreadParticipant } from '@/ai/types/AgentChatThreadParticipant';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

// Rows the server sent, kept so they are not lost before the first page of
// threads brings the member's rows
export const agentChatThreadStreamedParticipantsState = createAtomState<
  Record<string, AgentChatThreadParticipant>
>({
  key: 'ai/agentChatThreadStreamedParticipantsState',
  defaultValue: {},
});
