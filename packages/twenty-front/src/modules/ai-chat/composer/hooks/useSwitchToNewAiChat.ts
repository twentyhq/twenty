import { useStore } from 'jotai';

import { useOpenAiChatThread } from '@/ai-chat/hooks/useOpenAiChatThread';
import { aiChatComposerNewThreadRecipientsFamilyState } from '@/ai-chat/states/composer/aiChatComposerNewThreadRecipientsFamilyState';
import { newAiChatThreadIdState } from '@/ai-chat/states/newAiChatThreadIdState';
import { aiChatComposerShouldFocusFamilyState } from '@/ai-chat/states/composer/aiChatComposerShouldFocusFamilyState';
import { isCurrentPathAiChatPage } from '~/utils/isCurrentPathAiChatPage';
import { isInboxPath } from '~/utils/isInboxPath';

type UseSwitchToNewAiChatParams = {
  shouldOpenInFullPage?: boolean;
};

export const useSwitchToNewAiChat = ({
  shouldOpenInFullPage = false,
}: UseSwitchToNewAiChatParams = {}) => {
  const store = useStore();
  const { openAiChatThread } = useOpenAiChatThread();

  const switchToNewChat = ({
    inboxChannelId = null,
  }: { inboxChannelId?: string | null } = {}) => {
    const newAiChatThreadId = store.get(newAiChatThreadIdState.atom);
    const isShownInPage =
      shouldOpenInFullPage ||
      isCurrentPathAiChatPage() ||
      isInboxPath(window.location.pathname);

    store.set(
      aiChatComposerNewThreadRecipientsFamilyState.atomFamily(
        newAiChatThreadId,
      ),
      (recipients) => ({
        ...recipients,
        channelId: isShownInPage ? inboxChannelId : null,
      }),
    );

    openAiChatThread({ threadId: newAiChatThreadId, shouldOpenInFullPage });

    store.set(
      aiChatComposerShouldFocusFamilyState.atomFamily({
        threadId: newAiChatThreadId,
      }),
      true,
    );

    return newAiChatThreadId;
  };

  return { switchToNewChat };
};
