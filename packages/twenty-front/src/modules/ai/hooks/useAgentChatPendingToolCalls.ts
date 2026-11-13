import { useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { inboxDisplayedThreadState } from '@/ai/states/inboxDisplayedThreadState';
import { agentChatIsStreamingFamilyState } from '@/ai/states/agentChatIsStreamingFamilyState';
import { inboxDisplayedThreadMessagesSelector } from '@/ai/states/selectors/inboxDisplayedThreadMessagesSelector';
import { type AgentChatPendingToolCall } from '@/ai/types/AgentChatPendingToolCall';
import { parsePendingToolCall } from '@/ai/utils/parsePendingToolCall';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';

export const useAgentChatPendingToolCalls = (): AgentChatPendingToolCall[] => {
  const inboxDisplayedThread = useAtomStateValue(inboxDisplayedThreadState);
  const inboxDisplayedThreadMessages = useAtomStateValue(
    inboxDisplayedThreadMessagesSelector,
  );
  const agentChatIsStreaming = useAtomFamilyStateValue(
    agentChatIsStreamingFamilyState,
    { threadId: inboxDisplayedThread },
  );

  return useMemo(
    () =>
      agentChatIsStreaming
        ? []
        : inboxDisplayedThreadMessages.flatMap((message) =>
            message.parts
              .map(parsePendingToolCall)
              .filter((pendingToolCall) => isDefined(pendingToolCall)),
          ),
    [inboxDisplayedThreadMessages, agentChatIsStreaming],
  );
};
