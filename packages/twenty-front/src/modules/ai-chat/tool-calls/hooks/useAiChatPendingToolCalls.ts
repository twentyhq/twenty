import { useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { aiChatReplyStatusFamilyState } from '@/ai-chat/states/aiChatReplyStatusFamilyState';
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
  const aiChatReplyStatus = useAtomFamilyStateValue(
    aiChatReplyStatusFamilyState,
    { threadId },
  );
  const isAiChatStreaming = aiChatReplyStatus === 'streaming';

  return useMemo(
    () =>
      isAiChatStreaming
        ? []
        : aiChatMessages.flatMap((message) =>
            message.parts
              .map(parsePendingToolCall)
              .filter((pendingToolCall) => isDefined(pendingToolCall)),
          ),
    [aiChatMessages, isAiChatStreaming],
  );
};
