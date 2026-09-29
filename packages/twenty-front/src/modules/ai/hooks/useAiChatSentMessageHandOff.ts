import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useTheme } from 'twenty-ui/theme';

import { agentChatDisplayedThreadState } from '@/ai/states/agentChatDisplayedThreadState';
import { agentChatSentMessageHandOffState } from '@/ai/states/agentChatSentMessageHandOffState';
import { getTextBoundingClientRect } from '@/ai/utils/getTextBoundingClientRect';

export const useAiChatSentMessageHandOff = () => {
  const store = useStore();
  const theme = useTheme();

  return useCallback(
    (messageTextElement: HTMLDivElement | null) => {
      const sentMessageHandOff = store.get(
        agentChatSentMessageHandOffState.atom,
      );

      if (
        !isDefined(messageTextElement) ||
        !isDefined(sentMessageHandOff) ||
        sentMessageHandOff.threadId !==
          store.get(agentChatDisplayedThreadState.atom)
      ) {
        return;
      }

      store.set(agentChatSentMessageHandOffState.atom, null);

      if (
        !sentMessageHandOff.composerTextElement.isConnected ||
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ) {
        return;
      }

      const origin = getTextBoundingClientRect(
        sentMessageHandOff.composerTextElement,
      );
      const destination = getTextBoundingClientRect(messageTextElement);

      messageTextElement.animate(
        [
          {
            transform: `translate(${origin.left - destination.left}px, ${origin.top - destination.top}px)`,
          },
          { transform: 'none' },
        ],
        {
          duration: theme.animation.duration.normal * 1000,
          easing: 'ease-out',
        },
      );
    },
    [store, theme],
  );
};
