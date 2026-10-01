import { type AgentChatThreadParticipantState } from '@/ai/types/AgentChatThreadParticipantState';

export type AgentChatThreadInboxState = {
  lastActivityAt: string | null;
  participant: AgentChatThreadParticipantState | null;
};
