import { useAiChatPendingToolCalls } from '@/ai-chat/tool-calls/hooks/useAiChatPendingToolCalls';
import { useCurrentAiChatThreadAccess } from '@/ai-chat/threads/hooks/useCurrentAiChatThreadAccess';

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
