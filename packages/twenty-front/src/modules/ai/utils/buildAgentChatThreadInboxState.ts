import {
  type AgentChatThreadInboxState,
  type AgentChatThreadParticipantState,
} from 'twenty-shared/types';

import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';

export const buildAgentChatThreadInboxState = (
  thread: Pick<AgentChatThreadRecord, 'lastActivityAt'> | null | undefined,
  participant: AgentChatThreadParticipantState | undefined,
): AgentChatThreadInboxState => ({
  lastActivityAt: thread?.lastActivityAt ?? null,
  participant: participant ?? null,
});
