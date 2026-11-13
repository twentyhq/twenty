import { useAiChatPendingToolCalls } from '@/ai/hooks/useAiChatPendingToolCalls';
import { useCurrentAiChatThreadAccess } from '@/ai/hooks/useCurrentAiChatThreadAccess';

export const useIsAiChatToolCallAskedInComposer = (toolCallId: string) => {
  const pendingToolCalls = useAiChatPendingToolCalls();
  const access = useCurrentAiChatThreadAccess();

  return (
    access === 'writer' &&
    pendingToolCalls.some(
      (pendingToolCall) => pendingToolCall.toolCallId === toolCallId,
    )
  );
};
