import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { aiChatDisplayedThreadComponentState } from '@/ai/states/aiChatDisplayedThreadComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { aiChatIsStreamingFamilyState } from '@/ai/states/aiChatIsStreamingFamilyState';
import { aiChatDisplayedThreadMessagesComponentSelector } from '@/ai/states/selectors/aiChatDisplayedThreadMessagesComponentSelector';
import { type AiChatPendingToolCall } from '@/ai/types/AiChatPendingToolCall';
import { parsePendingToolCall } from '@/ai/utils/parsePendingToolCall';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';

export const useAiChatPendingToolCalls = (): AiChatPendingToolCall[] => {
  const aiChatDisplayedThread = useAtomComponentStateValue(
    aiChatDisplayedThreadComponentState,
  );
  const aiChatDisplayedThreadMessages = useAtomComponentSelectorValue(
    aiChatDisplayedThreadMessagesComponentSelector,
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
