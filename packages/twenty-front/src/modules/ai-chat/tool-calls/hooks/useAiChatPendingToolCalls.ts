import { useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { aiChatThreadReplyStatusFamilyState } from '@/ai-chat/states/reply/aiChatThreadReplyStatusFamilyState';
import { aiChatThreadDisplayedMessagesFamilyState } from '@/ai-chat/states/display/aiChatThreadDisplayedMessagesFamilyState';
import { useAiChatInstanceOrThrow } from '@/ai-chat/hooks/useAiChatInstanceOrThrow';
import { type AiChatPendingToolCall } from '@/ai-chat/tool-calls/types/AiChatPendingToolCall';
import { parsePendingToolCall } from '@/ai-chat/tool-calls/utils/parsePendingToolCall';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';

export const useAiChatPendingToolCalls = (): AiChatPendingToolCall[] => {
  const { threadId } = useAiChatInstanceOrThrow();
  const aiChatThreadDisplayedMessages = useAtomFamilyStateValue(
    aiChatThreadDisplayedMessagesFamilyState,
    {
      threadId,
    },
  );
  const aiChatThreadReplyStatus = useAtomFamilyStateValue(
    aiChatThreadReplyStatusFamilyState,
    { threadId },
  );
  const isAiChatStreaming = aiChatThreadReplyStatus === 'streaming';

  return useMemo(
    () =>
      isAiChatStreaming
        ? []
        : aiChatThreadDisplayedMessages.flatMap((message) =>
            message.parts
              .map(parsePendingToolCall)
              .filter((pendingToolCall) => isDefined(pendingToolCall)),
          ),
    [aiChatThreadDisplayedMessages, isAiChatStreaming],
  );
};
