import { useAgentChatPendingToolCalls } from '@/ai/hooks/useAgentChatPendingToolCalls';
import { useCurrentAiChatThreadAccess } from '@/ai/hooks/useCurrentAiChatThreadAccess';

export const useIsAgentChatToolCallAskedInComposer = (toolCallId: string) => {
  const pendingToolCalls = useAgentChatPendingToolCalls();
  const access = useCurrentAiChatThreadAccess();

  return (
    access === 'writer' &&
    pendingToolCalls.some(
      (pendingToolCall) => pendingToolCall.toolCallId === toolCallId,
    )
  );
};
