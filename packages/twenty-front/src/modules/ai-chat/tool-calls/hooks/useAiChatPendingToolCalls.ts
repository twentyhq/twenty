import { useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { aiChatThreadIsStreamingFamilySelector } from '@/ai-chat/states/selectors/aiChatThreadIsStreamingFamilySelector';
import { aiChatThreadDisplayedMessagesFamilyState } from '@/ai-chat/states/display/aiChatThreadDisplayedMessagesFamilyState';
import { useAiChatInstanceOrThrow } from '@/ai-chat/hooks/useAiChatInstanceOrThrow';
import { type AiChatPendingToolCall } from '@/ai-chat/tool-calls/types/AiChatPendingToolCall';
import { parsePendingToolCall } from '@/ai-chat/tool-calls/utils/parsePendingToolCall';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';

export const useAiChatPendingToolCalls = (): AiChatPendingToolCall[] => {
  const { threadId } = useAiChatInstanceOrThrow();
  const aiChatThreadDisplayedMessages = useAtomFamilyStateValue(
    aiChatThreadDisplayedMessagesFamilyState,
    {
      threadId,
    },
  );
  const aiChatThreadIsStreaming = useAtomFamilySelectorValue(
    aiChatThreadIsStreamingFamilySelector,
    { threadId },
  );

  return useMemo(
    () =>
      aiChatThreadIsStreaming
        ? []
        : aiChatThreadDisplayedMessages.flatMap((message) =>
            message.parts
              .map(parsePendingToolCall)
              .filter((pendingToolCall) => isDefined(pendingToolCall)),
          ),
    [aiChatThreadDisplayedMessages, aiChatThreadIsStreaming],
  );
};
