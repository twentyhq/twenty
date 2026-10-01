import { useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { agentChatDisplayedThreadState } from '@/ai/states/agentChatDisplayedThreadState';
import { agentChatIsStreamingComponentFamilyState } from '@/ai/states/agentChatIsStreamingComponentFamilyState';
import { agentChatMessagesComponentFamilyState } from '@/ai/states/agentChatMessagesComponentFamilyState';
import { type AgentChatPendingToolCall } from '@/ai/types/AgentChatPendingToolCall';
import { parsePendingToolCall } from '@/ai/utils/parsePendingToolCall';
import { useAtomComponentFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

// The conversation waits once its turn is over, on every call still pending,
// in the order the agent made them.
export const useAgentChatPendingToolCalls = (): AgentChatPendingToolCall[] => {
  const agentChatDisplayedThread = useAtomStateValue(
    agentChatDisplayedThreadState,
  );
  const agentChatMessages = useAtomComponentFamilyStateValue(
    agentChatMessagesComponentFamilyState,
    { threadId: agentChatDisplayedThread },
  );
  const agentChatIsStreaming = useAtomComponentFamilyStateValue(
    agentChatIsStreamingComponentFamilyState,
    { threadId: agentChatDisplayedThread },
  );

  return useMemo(
    () =>
      agentChatIsStreaming
        ? []
        : agentChatMessages.flatMap((message) =>
            message.parts
              .map(parsePendingToolCall)
              .filter((pendingToolCall) => isDefined(pendingToolCall)),
          ),
    [agentChatMessages, agentChatIsStreaming],
  );
};
