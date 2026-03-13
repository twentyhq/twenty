import { useEffect } from 'react';

import { AI_CHAT_SCROLL_WRAPPER_ID } from '@/ai/constants/AiChatScrollWrapperId';
import { useProcessChatScroll } from '@/ai/hooks/useProcessChatScroll';
import { agentChatMessagesComponentState } from '@/ai/states/agentChatMessagesComponentState';
import { useScrollWrapperHTMLElement } from '@/ui/utilities/scroll/hooks/useScrollWrapperHTMLElement';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useStore } from 'jotai';
import { useDebouncedCallback } from 'use-debounce';

const SCROLL_DEBOUNCE_MS = 16;

export const AIChatVirtualizedScrollEffect = () => {
  const { scrollWrapperHTMLElement } = useScrollWrapperHTMLElement(
    AI_CHAT_SCROLL_WRAPPER_ID,
  );

  const { processScroll } = useProcessChatScroll();

  const store = useStore();

  const messagesCallbackState = useAtomComponentStateCallbackState(
    agentChatMessagesComponentState,
  );

  const processScrollDebounced = useDebouncedCallback(
    processScroll,
    SCROLL_DEBOUNCE_MS,
    {
      leading: true,
      trailing: true,
      maxWait: SCROLL_DEBOUNCE_MS,
    },
  );

  useEffect(() => {
    const handleScroll = () => {
      processScrollDebounced();
    };

    scrollWrapperHTMLElement?.addEventListener('scroll', handleScroll);

    return () => {
      scrollWrapperHTMLElement?.removeEventListener('scroll', handleScroll);
    };
  }, [scrollWrapperHTMLElement, processScrollDebounced]);

  useEffect(() => {
    return store.sub(messagesCallbackState, () => {
      processScroll();
    });
  }, [store, messagesCallbackState, processScroll]);

  useEffect(() => {
    processScroll();
  }, [processScroll]);

  return null;
};
