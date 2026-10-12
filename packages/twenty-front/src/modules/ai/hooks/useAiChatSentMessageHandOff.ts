import { useReducedMotion } from 'framer-motion';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useTheme } from 'twenty-ui/theme';

import { agentChatSentMessageHandOffState } from '@/ai/states/agentChatSentMessageHandOffState';
import { getTextBoundingClientRect } from '@/ai/utils/getTextBoundingClientRect';

export const useAiChatSentMessageHandOff = (messageId: string) => {
  const store = useStore();
  const theme = useTheme();
  const shouldReduceMotion = useReducedMotion();

  return useCallback(
    (messageTextElement: HTMLDivElement | null) => {
      const sentMessageHandOff = store.get(
        agentChatSentMessageHandOffState.atom,
      );

      if (
        !isDefined(messageTextElement) ||
        !isDefined(sentMessageHandOff) ||
        sentMessageHandOff.messageId !== messageId
      ) {
        return;
      }

      store.set(agentChatSentMessageHandOffState.atom, null);

      if (shouldReduceMotion) {
        return;
      }

      requestAnimationFrame(() => {
        if (!messageTextElement.isConnected) {
          return;
        }

        const origin = sentMessageHandOff.composerTextRect;
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
      });
    },
    [messageId, store, theme, shouldReduceMotion],
  );
};
