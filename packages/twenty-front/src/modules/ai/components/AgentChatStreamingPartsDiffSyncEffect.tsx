import { useUpdateStreamingPartsWithDiff } from '@/ai/hooks/useUpdateStreamingPartsWithDiff';
import { aiChatMessagesFamilyState } from '@/ai/states/agentChatMessagesFamilyState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useEffect } from 'react';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';

export const AiChatStreamingPartsDiffSyncEffect = () => {
  const currentAiChatThread = useAtomStateValue(currentAiChatThreadState);

  const aiChatMessages = useAtomFamilyStateValue(aiChatMessagesFamilyState, {
    threadId: currentAiChatThread,
  });

  const { updateStreamingPartsWithDiff } = useUpdateStreamingPartsWithDiff();

  useEffect(() => {
    if (aiChatMessages.length === 0) {
      return;
    }

    updateStreamingPartsWithDiff(aiChatMessages);
  }, [aiChatMessages, updateStreamingPartsWithDiff]);

  return null;
};
