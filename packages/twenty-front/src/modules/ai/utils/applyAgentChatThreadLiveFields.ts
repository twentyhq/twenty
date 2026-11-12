import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';

export const applyAgentChatThreadLiveFields = ({
  loadedThread,
  storedThread,
  fieldUpdateCounts,
  updateCountBeforeLoad,
}: {
  loadedThread: AgentChatThreadRecord;
  storedThread: AgentChatThreadRecord;
  fieldUpdateCounts: Record<string, number>;
  updateCountBeforeLoad: number;
}): AgentChatThreadRecord => ({
  ...loadedThread,
  ...Object.fromEntries(
    Object.entries(storedThread).filter(
      ([fieldName]) =>
        (fieldUpdateCounts[fieldName] ?? 0) > updateCountBeforeLoad,
    ),
  ),
});
