import { useLayoutEffect } from 'react';

import { useAiChatInstanceOrThrow } from '@/ai/hooks/useAiChatInstanceOrThrow';
import { aiChatDisplayedThreadComponentState } from '@/ai/states/aiChatDisplayedThreadComponentState';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';

export const AiChatInstanceDisplayedThreadEffect = () => {
  const { threadId } = useAiChatInstanceOrThrow();
  const [aiChatDisplayedThread, setAiChatDisplayedThread] =
    useAtomComponentState(aiChatDisplayedThreadComponentState);

  useLayoutEffect(() => {
    if (aiChatDisplayedThread !== threadId) {
      setAiChatDisplayedThread(threadId);
    }
  }, [threadId, aiChatDisplayedThread, setAiChatDisplayedThread]);

  return null;
};
