import { useStore } from 'jotai';

import { useOpenAiChatThread } from '@/ai-chat/hooks/useOpenAiChatThread';
import { aiChatNewThreadChannelIdState } from '@/ai-chat/composer/states/aiChatNewThreadChannelIdState';
import { newAiChatThreadIdState } from '@/ai-chat/states/newAiChatThreadIdState';
import { aiChatShouldFocusEditorFamilyState } from '@/ai-chat/states/aiChatShouldFocusEditorFamilyState';
import { isInboxPath } from '~/utils/isInboxPath';

type UseSwitchToNewAiChatParams = {
  shouldOpenInFullPage?: boolean;
};

export const useSwitchToNewAiChat = ({
  shouldOpenInFullPage = false,
}: UseSwitchToNewAiChatParams = {}) => {
  const store = useStore();
  const { openAiChatThread } = useOpenAiChatThread();

  const switchToNewChat = () => {
    if (!isInboxPath(window.location.pathname)) {
      store.set(aiChatNewThreadChannelIdState.atom, null);
    }

    const newAiChatThreadId = store.get(newAiChatThreadIdState.atom);

    openAiChatThread({ threadId: newAiChatThreadId, shouldOpenInFullPage });

    store.set(
      aiChatShouldFocusEditorFamilyState.atomFamily({
        threadId: newAiChatThreadId,
      }),
      true,
    );

    return newAiChatThreadId;
  };

  return { switchToNewChat };
};
