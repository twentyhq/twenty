import { useStore } from 'jotai';
import { useLayoutEffect } from 'react';

import { closingInboxThreadIdState } from '@/ai/states/closingAiChatInboxThreadIdState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { resetClosingInboxThread } from '@/ai/utils/resetClosingAiChatInboxThread';

type InboxConversationCloseEffectProps = {
  isPresent: boolean;
};

export const InboxConversationCloseEffect = ({
  isPresent,
}: InboxConversationCloseEffectProps) => {
  const store = useStore();

  useLayoutEffect(() => {
    store.set(
      closingInboxThreadIdState.atom,
      isPresent ? null : store.get(currentAiChatThreadState.atom),
    );
  }, [isPresent, store]);

  useLayoutEffect(() => {
    return () => resetClosingInboxThread(store);
  }, [store]);

  return null;
};
