import { useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { aiChatDisplayedThreadState } from '@/ai/states/agentChatDisplayedThreadState';
import { aiChatIsStreamingFamilyState } from '@/ai/states/agentChatIsStreamingFamilyState';
import { aiChatDisplayedThreadMessagesSelector } from '@/ai/states/selectors/agentChatDisplayedThreadMessagesSelector';
import { type AiChatPendingToolCall } from '@/ai/types/AgentChatPendingToolCall';
import { parsePendingToolCall } from '@/ai/utils/parsePendingToolCall';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';

export const useAiChatPendingToolCalls = (): AiChatPendingToolCall[] => {
  const aiChatDisplayedThread = useAtomStateValue(aiChatDisplayedThreadState);
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
