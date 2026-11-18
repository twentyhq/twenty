import { useAiChatPendingToolCalls } from '@/ai-chat/hooks/useAiChatPendingToolCalls';
import { useCurrentAiChatThreadAccess } from '@/ai-chat/hooks/useCurrentAiChatThreadAccess';

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
