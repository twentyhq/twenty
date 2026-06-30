import { useUpdateStreamingPartsWithDiff } from '@/ai/hooks/useUpdateStreamingPartsWithDiff';
import { agentChatLastDiffSyncedThreadState } from '@/ai/states/agentChatLastDiffSyncedThreadState';
import { agentChatMessagesComponentFamilyState } from '@/ai/states/agentChatMessagesComponentFamilyState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { useAtomComponentFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useEffect } from 'react';

export const AgentChatStreamingPartsDiffSyncEffect = () => {
  const currentAiChatThread = useAtomStateValue(currentAiChatThreadState);

  const agentChatMessages = useAtomComponentFamilyStateValue(
    agentChatMessagesComponentFamilyState,
    { threadId: currentAiChatThread },
  );

  const { updateStreamingPartsWithDiff } = useUpdateStreamingPartsWithDiff();

  const setAgentChatLastDiffSyncedThread = useSetAtomState(
    agentChatLastDiffSyncedThreadState,
  );

  useEffect(() => {
    if (agentChatMessages.length === 0) {
      return;
    }

    updateStreamingPartsWithDiff(agentChatMessages);
    setAgentChatLastDiffSyncedThread(currentAiChatThread);
  }, [
    agentChatMessages,
    updateStreamingPartsWithDiff,
    currentAiChatThread,
    setAgentChatLastDiffSyncedThread,
  ]);

  return null;
};
