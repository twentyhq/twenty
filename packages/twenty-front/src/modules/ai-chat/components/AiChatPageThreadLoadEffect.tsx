import { useStore } from 'jotai';
import { isAiChatThreadRecordComplete } from '@/ai-chat/threads/utils/isAiChatThreadRecordComplete';
import { useEffect } from 'react';

import { useLoadAiChatThread } from '@/ai-chat/hooks/useLoadAiChatThread';
import { useSelectAiChatThread } from '@/ai-chat/hooks/useSelectAiChatThread';
import { newAiChatThreadIdState } from '@/ai-chat/states/newAiChatThreadIdState';
import { aiChatThreadRecordFamilySelector } from '@/ai-chat/threads/states/selectors/aiChatThreadRecordFamilySelector';

type AiChatPageThreadLoadEffectProps = {
  threadId: string;
};

export const AiChatPageThreadLoadEffect = ({
  threadId,
}: AiChatPageThreadLoadEffectProps) => {
  const store = useStore();
  const { loadAiChatThread } = useLoadAiChatThread();
  const { selectAiChatThread } = useSelectAiChatThread();

  useEffect(() => {
    const storedThread = store.get(
      aiChatThreadRecordFamilySelector.selectorFamily(threadId),
    );

    if (isAiChatThreadRecordComplete(storedThread)) {
      return;
    }

    let isActive = true;

    void loadAiChatThread(threadId).then((loadedThread) => {
      if (isActive && loadedThread === null) {
        selectAiChatThread(store.get(newAiChatThreadIdState.atom));
      }
    });

    return () => {
      isActive = false;
    };
  }, [threadId, store, loadAiChatThread, selectAiChatThread]);

  return null;
};
