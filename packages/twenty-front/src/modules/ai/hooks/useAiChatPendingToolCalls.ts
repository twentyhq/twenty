import { useAiChatDisplayedThreadId } from '@/ai/hooks/useAiChatDisplayedThreadId';
import { useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { aiChatIsStreamingFamilyState } from '@/ai/states/aiChatIsStreamingFamilyState';
import { aiChatDisplayedThreadMessagesSelector } from '@/ai/states/selectors/aiChatDisplayedThreadMessagesSelector';
import { type AiChatPendingToolCall } from '@/ai/types/AiChatPendingToolCall';
import { parsePendingToolCall } from '@/ai/utils/parsePendingToolCall';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';

export const useAiChatPendingToolCalls = (): AiChatPendingToolCall[] => {
  const aiChatDisplayedThread = useAiChatDisplayedThreadId();
  const aiChatDisplayedThreadMessages = useAtomStateValue(
    aiChatDisplayedThreadMessagesSelector,
  );
  const aiChatIsStreaming = useAtomFamilyStateValue(
    aiChatIsStreamingFamilyState,
    { threadId: aiChatDisplayedThread },
  );

  return useMemo(
    () =>
      aiChatIsStreaming
        ? []
        : aiChatDisplayedThreadMessages.flatMap((message) =>
            message.parts
              .map(parsePendingToolCall)
              .filter((pendingToolCall) => isDefined(pendingToolCall)),
          ),
    [aiChatDisplayedThreadMessages, aiChatIsStreaming],
  );
};
