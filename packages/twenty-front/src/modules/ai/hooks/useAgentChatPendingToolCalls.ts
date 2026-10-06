import { useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { agentChatDisplayedThreadState } from '@/ai/states/agentChatDisplayedThreadState';
import { agentChatIsStreamingComponentFamilyState } from '@/ai/states/agentChatIsStreamingComponentFamilyState';
import { agentChatDisplayedThreadMessagesComponentSelector } from '@/ai/states/selectors/agentChatDisplayedThreadMessagesComponentSelector';
import { type AgentChatPendingToolCall } from '@/ai/types/AgentChatPendingToolCall';
import { parsePendingToolCall } from '@/ai/utils/parsePendingToolCall';
import { useAtomComponentFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateValue';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useAgentChatPendingToolCalls = (): AgentChatPendingToolCall[] => {
  const agentChatDisplayedThread = useAtomStateValue(
    agentChatDisplayedThreadState,
  );
  const agentChatMessages = useAtomComponentSelectorValue(
    agentChatDisplayedThreadMessagesComponentSelector,
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
