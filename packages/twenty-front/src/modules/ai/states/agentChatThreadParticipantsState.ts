import { type AgentChatThreadParticipantState } from '@/ai/types/AgentChatThreadParticipantState';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const agentChatThreadParticipantsState = createAtomState<
  Record<string, AgentChatThreadParticipantState>
>({
  key: 'ai/agentChatThreadParticipantsState',
  defaultValue: {},
});
