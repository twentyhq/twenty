import { useStore } from 'jotai';
import { useLayoutEffect, useState } from 'react';

import { useSwitchAgentChatThreadWithDraft } from '@/ai/hooks/useSwitchAgentChatThreadWithDraft';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { newAiChatThreadIdState } from '@/ai/states/newAiChatThreadIdState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const AiChatNewThreadSelectionEffect = () => {
  const store = useStore();
  const [newRouteThreadId] = useState(() =>
    store.get(newAiChatThreadIdState.atom),
  );
  const currentAiChatThread = useAtomStateValue(currentAiChatThreadState);
  const { switchThreadWithDraft } = useSwitchAgentChatThreadWithDraft();

  useLayoutEffect(() => {
    if (currentAiChatThread === newRouteThreadId) {
      return;
    }

    switchThreadWithDraft(newRouteThreadId);
  }, [currentAiChatThread, newRouteThreadId, switchThreadWithDraft]);

  return null;
};
