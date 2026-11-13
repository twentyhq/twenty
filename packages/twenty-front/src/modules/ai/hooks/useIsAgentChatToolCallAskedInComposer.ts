import { useAgentChatPendingToolCalls } from '@/ai/hooks/useAgentChatPendingToolCalls';
import { useCurrentInboxThreadAccess } from '@/ai/hooks/useCurrentAiChatThreadAccess';

export const useIsAgentChatToolCallAskedInComposer = (toolCallId: string) => {
  const pendingToolCalls = useAgentChatPendingToolCalls();
  const access = useCurrentInboxThreadAccess();

  return (
    access === 'writer' &&
    pendingToolCalls.some(
      (pendingToolCall) => pendingToolCall.toolCallId === toolCallId,
    )
  );
};
