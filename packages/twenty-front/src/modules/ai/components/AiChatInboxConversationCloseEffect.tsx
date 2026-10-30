import { useStore } from 'jotai';
import { useLayoutEffect } from 'react';

import { closingAiChatInboxThreadIdState } from '@/ai/states/closingAiChatInboxThreadIdState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { resetClosingAiChatInboxThread } from '@/ai/utils/resetClosingAiChatInboxThread';

type AiChatInboxConversationCloseEffectProps = {
  isPresent: boolean;
};

export const AiChatInboxConversationCloseEffect = ({
  isPresent,
}: AiChatInboxConversationCloseEffectProps) => {
  const store = useStore();

  useLayoutEffect(() => {
    store.set(
      closingAiChatInboxThreadIdState.atom,
      isPresent ? null : store.get(currentAiChatThreadState.atom),
    );
  }, [isPresent, store]);

  useLayoutEffect(() => {
    return () => resetClosingAiChatInboxThread(store);
  }, [store]);

  return null;
};
