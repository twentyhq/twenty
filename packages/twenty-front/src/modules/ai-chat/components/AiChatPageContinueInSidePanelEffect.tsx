import { useStore } from 'jotai';
import { useEffect } from 'react';

import { aiChatPageHandoffThreadIdState } from '@/ai-chat/states/aiChatPageHandoffThreadIdState';

type AiChatPageContinueInSidePanelEffectProps = {
  threadId: string;
};

export const AiChatPageContinueInSidePanelEffect = ({
  threadId,
}: AiChatPageContinueInSidePanelEffectProps) => {
  const store = useStore();

  useEffect(
    () => () => {
      store.set(aiChatPageHandoffThreadIdState.atom, threadId);
    },
    [store, threadId],
  );

  return null;
};
