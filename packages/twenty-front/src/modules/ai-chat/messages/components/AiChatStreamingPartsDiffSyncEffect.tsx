import { useAiChatInstanceOrThrow } from '@/ai-chat/hooks/useAiChatInstanceOrThrow';
import { useUpdateStreamingPartsWithDiff } from '@/ai-chat/messages/hooks/useUpdateStreamingPartsWithDiff';
import { aiChatMessagesFamilyState } from '@/ai-chat/states/aiChatMessagesFamilyState';
import { useEffect } from 'react';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';

export const AiChatStreamingPartsDiffSyncEffect = () => {
  const { threadId } = useAiChatInstanceOrThrow();

  const aiChatMessages = useAtomFamilyStateValue(aiChatMessagesFamilyState, {
    threadId,
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
