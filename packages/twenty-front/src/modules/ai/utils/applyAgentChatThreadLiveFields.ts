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
    Object.entries(fieldUpdateCounts)
      .filter(
        ([fieldName, fieldUpdateCount]) =>
          fieldUpdateCount > updateCountBeforeLoad && fieldName in storedThread,
      )
      .map(([fieldName]) => [
        fieldName,
        storedThread[fieldName as keyof AgentChatThreadRecord],
      ]),
  ),
});
