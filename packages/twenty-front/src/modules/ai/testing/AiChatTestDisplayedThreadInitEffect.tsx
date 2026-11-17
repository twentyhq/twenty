import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { useAiChatInstanceOrThrow } from '@/ai/hooks/useAiChatInstanceOrThrow';
import { aiChatDisplayedThreadComponentState } from '@/ai/states/aiChatDisplayedThreadComponentState';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';

export const AiChatTestDisplayedThreadInitEffect = () => {
  const { threadId } = useAiChatInstanceOrThrow();
  const [aiChatDisplayedThread, setAiChatDisplayedThread] =
    useAtomComponentState(aiChatDisplayedThreadComponentState);

  useEffect(() => {
    if (!isDefined(aiChatDisplayedThread)) {
      setAiChatDisplayedThread(threadId);
    }
  }, [aiChatDisplayedThread, threadId, setAiChatDisplayedThread]);

  return null;
};
