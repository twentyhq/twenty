import { useUpdateStreamingPartsWithDiff } from '@/ai/hooks/useUpdateStreamingPartsWithDiff';
import { agentChatMessagesComponentFamilyState } from '@/ai/states/agentChatMessagesComponentFamilyState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { useAtomComponentFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useEffect } from 'react';

export const AgentChatStreamingPartsDiffSyncEffect = () => {
  const currentAiChatThread = useAtomStateValue(currentAiChatThreadState);

  const agentChatMessages = useAtomComponentFamilyStateValue(
    agentChatMessagesComponentFamilyState,
    { threadId: currentAiChatThread },
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
