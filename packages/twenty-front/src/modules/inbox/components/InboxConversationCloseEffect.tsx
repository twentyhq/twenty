import { useStore } from 'jotai';
import { useLayoutEffect } from 'react';

import { aiChatContinueInSidePanelThreadIdState } from '@/ai/states/aiChatContinueInSidePanelThreadIdState';

type InboxConversationCloseEffectProps = {
  isPresent: boolean;
};

export const InboxConversationCloseEffect = ({
  isPresent,
}: InboxConversationCloseEffectProps) => {
  const store = useStore();

  useLayoutEffect(() => {
    if (!isPresent) {
      store.set(aiChatContinueInSidePanelThreadIdState.atom, null);
    }
  }, [isPresent, store]);

  return null;
};
