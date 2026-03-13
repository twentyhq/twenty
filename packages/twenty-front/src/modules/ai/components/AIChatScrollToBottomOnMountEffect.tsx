import { useEffect } from 'react';

import { AI_CHAT_SCROLL_WRAPPER_ID } from '@/ai/constants/AiChatScrollWrapperId';
import { scrollAIChatToBottom } from '@/ai/utils/scrollAIChatToBottom';
import { currentAIChatThreadState } from '@/ai/states/currentAIChatThreadState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const AIChatScrollToBottomOnMountEffect = () => {
  const currentAIChatThread = useAtomStateValue(currentAIChatThreadState);

  useEffect(() => {
    const scrollWrapperElement = document.getElementById(
      `scroll-wrapper-${AI_CHAT_SCROLL_WRAPPER_ID}`,
    );

    if (!scrollWrapperElement) {
      return;
    }

    let hasScrolled = false;

    const mutationObserver = new MutationObserver(() => {
      if (
        !hasScrolled &&
        scrollWrapperElement.scrollHeight > scrollWrapperElement.clientHeight
      ) {
        hasScrolled = true;
        scrollAIChatToBottom();
        mutationObserver.disconnect();
      }
    });

    mutationObserver.observe(scrollWrapperElement, {
      childList: true,
      subtree: true,
    });

    return () => {
      mutationObserver.disconnect();
    };
  }, [currentAIChatThread]);

  return null;
};
