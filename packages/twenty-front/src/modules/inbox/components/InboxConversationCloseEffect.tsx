import { useStore } from 'jotai';
import { useLayoutEffect } from 'react';

import { closingAiChatThreadIdState } from '@/ai/states/closingAiChatThreadIdState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { resetClosingInboxThread } from '@/inbox/utils/resetClosingInboxThread';

type InboxConversationCloseEffectProps = {
  isPresent: boolean;
};

export const InboxConversationCloseEffect = ({
  isPresent,
}: InboxConversationCloseEffectProps) => {
  const store = useStore();

  useLayoutEffect(() => {
    store.set(
      closingAiChatThreadIdState.atom,
      isPresent ? null : store.get(currentAiChatThreadState.atom),
    );
  }, [isPresent, store]);

  useLayoutEffect(() => {
    return () => resetClosingInboxThread(store);
  }, [store]);

  return null;
};
