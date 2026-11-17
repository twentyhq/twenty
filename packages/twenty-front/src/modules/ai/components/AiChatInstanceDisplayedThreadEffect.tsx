import { useLayoutEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { useAiChatInstance } from '@/ai/hooks/useAiChatInstance';
import { aiChatDisplayedThreadComponentState } from '@/ai/states/aiChatDisplayedThreadComponentState';
import { aiChatIsStreamingFamilyState } from '@/ai/states/aiChatIsStreamingFamilyState';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';

export const AiChatInstanceDisplayedThreadEffect = () => {
  const { threadId } = useAiChatInstance();
  const [aiChatDisplayedThread, setAiChatDisplayedThread] =
    useAtomComponentState(aiChatDisplayedThreadComponentState);
  const aiChatIsStreaming = useAtomFamilyStateValue(
    aiChatIsStreamingFamilyState,
    { threadId },
  );

  useLayoutEffect(() => {
    if (
      aiChatDisplayedThread === threadId ||
      (aiChatIsStreaming && isDefined(aiChatDisplayedThread))
    ) {
      return;
    }

    setAiChatDisplayedThread(threadId);
  }, [
    threadId,
    aiChatDisplayedThread,
    aiChatIsStreaming,
    setAiChatDisplayedThread,
  ]);

  return null;
};
