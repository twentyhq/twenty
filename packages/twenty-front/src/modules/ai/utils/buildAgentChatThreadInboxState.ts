import { type AgentChatThreadInboxState } from '@/ai/types/AgentChatThreadInboxState';
import { type AgentChatThreadParticipantState } from '@/ai/types/AgentChatThreadParticipantState';
import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';

export const buildAgentChatThreadInboxState = (
  thread: Pick<AgentChatThreadRecord, 'lastActivityAt'> | null | undefined,
  participant: AgentChatThreadParticipantState | undefined,
): AgentChatThreadInboxState => ({
  lastActivityAt: thread?.lastActivityAt ?? null,
  participant: participant ?? null,
});
