import { useLayoutEffect } from 'react';

import { useAiChatInstance } from '@/ai/hooks/useAiChatInstance';
import { aiChatDisplayedThreadComponentState } from '@/ai/states/aiChatDisplayedThreadComponentState';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';

export const AiChatInstanceDisplayedThreadEffect = () => {
  const { threadId } = useAiChatInstance();
  const [aiChatDisplayedThread, setAiChatDisplayedThread] =
    useAtomComponentState(aiChatDisplayedThreadComponentState);

  useLayoutEffect(() => {
    if (aiChatDisplayedThread !== threadId) {
      setAiChatDisplayedThread(threadId);
    }
  }, [threadId, aiChatDisplayedThread, setAiChatDisplayedThread]);

  return null;
};
