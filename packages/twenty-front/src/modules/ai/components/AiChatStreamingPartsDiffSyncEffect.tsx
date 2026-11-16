import { useAiChatThreadId } from '@/ai/hooks/useAiChatThreadId';
import { useUpdateStreamingPartsWithDiff } from '@/ai/hooks/useUpdateStreamingPartsWithDiff';
import { aiChatMessagesFamilyState } from '@/ai/states/aiChatMessagesFamilyState';
import { useEffect } from 'react';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';

export const AiChatStreamingPartsDiffSyncEffect = () => {
  const currentAiChatThread = useAiChatThreadId();

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
