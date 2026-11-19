import { useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { aiChatIsStreamingFamilyState } from '@/ai-chat/states/aiChatIsStreamingFamilyState';
import { aiChatMessagesFamilyState } from '@/ai-chat/states/aiChatMessagesFamilyState';
import { useAiChatInstanceOrThrow } from '@/ai-chat/hooks/useAiChatInstanceOrThrow';
import { type AiChatPendingToolCall } from '@/ai-chat/tool-calls/types/AiChatPendingToolCall';
import { parsePendingToolCall } from '@/ai-chat/tool-calls/utils/parsePendingToolCall';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';

export const useAiChatPendingToolCalls = (): AiChatPendingToolCall[] => {
  const { threadId } = useAiChatInstanceOrThrow();
  const aiChatMessages = useAtomFamilyStateValue(aiChatMessagesFamilyState, {
    threadId,
  });
  const aiChatIsStreaming = useAtomFamilyStateValue(
    aiChatIsStreamingFamilyState,
    { threadId },
  );

  return useMemo(
    () =>
      aiChatIsStreaming
        ? []
        : aiChatMessages.flatMap((message) =>
            message.parts
              .map(parsePendingToolCall)
              .filter((pendingToolCall) => isDefined(pendingToolCall)),
          ),
    [aiChatMessages, aiChatIsStreaming],
  );
};
