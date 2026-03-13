import { useUpdateStreamingPartsWithDiff } from '@/ai/hooks/useUpdateStreamingPartsWithDiff';
import { agentChatMessagesComponentFamilyState } from '@/ai/states/agentChatMessagesComponentFamilyState';
import { currentAIChatThreadState } from '@/ai/states/currentAIChatThreadState';
import { useAtomComponentFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useEffect } from 'react';

export const AgentChatStreamingPartsDiffSyncEffect = () => {
  const currentAIChatThread = useAtomStateValue(currentAIChatThreadState);

  const agentChatMessages = useAtomComponentFamilyStateValue(
    agentChatMessagesComponentFamilyState,
    { threadId: currentAIChatThread },
  );

  const { updateStreamingPartsWithDiff } = useUpdateStreamingPartsWithDiff();

  useEffect(() => {
    if (agentChatMessages.length === 0) {
      return;
    }

    updateStreamingPartsWithDiff(agentChatMessages);
  }, [agentChatMessages, updateStreamingPartsWithDiff]);

  return null;
};
