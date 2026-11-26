import { useAiChatInstanceOrThrow } from '@/ai-chat/hooks/useAiChatInstanceOrThrow';
import { aiChatThreadPendingToolCallsFamilySelector } from '@/ai-chat/tool-calls/states/selectors/aiChatThreadPendingToolCallsFamilySelector';
import { type AiChatPendingToolCall } from '@/ai-chat/tool-calls/types/AiChatPendingToolCall';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';

export const useAiChatPendingToolCalls = (): AiChatPendingToolCall[] => {
  const { threadId } = useAiChatInstanceOrThrow();

  return useAtomFamilySelectorValue(
    aiChatThreadPendingToolCallsFamilySelector,
    { threadId },
  );
};
