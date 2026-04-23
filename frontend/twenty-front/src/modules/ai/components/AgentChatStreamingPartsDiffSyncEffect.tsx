import { useUpdateStreamingPartsWithDiff } from '@/ai/hooks/useUpdateStreamingPartsWithDiff';
import { agentChatLastDiffSyncedThreadState } from '@/ai/states/agentChatLastDiffSyncedThreadState';
import { agentChatMessagesComponentFamilyState } from '@/ai/states/agentChatMessagesComponentFamilyState';
import { currentAIChatThreadState } from '@/ai/states/currentAIChatThreadState';
import { useAtomComponentFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useEffect } from 'react';

export const AgentChatStreamingPartsDiffSyncEffect = () => {
  const currentAIChatThread = useAtomStateValue(currentAIChatThreadState);

  const agentChatMessages = useAtomComponentFamilyStateValue(
    agentChatMessagesComponentFamilyState,
    { threadId: currentAIChatThread },
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
    setAgentChatLastDiffSyncedThread(currentAIChatThread);
  }, [
    agentChatMessages,
    updateStreamingPartsWithDiff,
    currentAIChatThread,
    setAgentChatLastDiffSyncedThread,
  ]);

  return null;
};
