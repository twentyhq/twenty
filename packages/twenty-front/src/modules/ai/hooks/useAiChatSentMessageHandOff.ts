import { useReducedMotion } from 'framer-motion';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useTheme } from 'twenty-ui/theme';

import { agentChatDisplayedThreadState } from '@/ai/states/agentChatDisplayedThreadState';
import { agentChatSentMessageHandOffState } from '@/ai/states/agentChatSentMessageHandOffState';
import { threadIdCreatedFromDraftState } from '@/ai/states/threadIdCreatedFromDraftState';
import { getTextBoundingClientRect } from '@/ai/utils/getTextBoundingClientRect';
import { isSentMessageHandOffForDisplayedThread } from '@/ai/utils/isSentMessageHandOffForDisplayedThread';

export const useAiChatSentMessageHandOff = () => {
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
        !isSentMessageHandOffForDisplayedThread({
          handOffThreadId: sentMessageHandOff.threadId,
          displayedThreadId: store.get(agentChatDisplayedThreadState.atom),
          threadIdCreatedFromDraft: store.get(
            threadIdCreatedFromDraftState.atom,
          ),
        })
      ) {
        return;
      }

      store.set(agentChatSentMessageHandOffState.atom, null);

      if (
        shouldReduceMotion ||
        !sentMessageHandOff.composerTextElement.isConnected
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
    [store, theme, shouldReduceMotion],
  );
};
