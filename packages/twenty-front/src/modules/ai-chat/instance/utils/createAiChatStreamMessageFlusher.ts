import { type ApolloClient } from '@apollo/client';
import { type createStore } from 'jotai';
import { type ExtendedUIMessage } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import { refetchToolIndexOnUnknownTools } from '@/ai-chat/instance/utils/refetchToolIndexOnUnknownTools';
import { upsertAiChatMessage } from '@/ai-chat/instance/utils/upsertAiChatMessage';
import { aiChatThreadDisplayedMessagesFamilyState } from '@/ai-chat/states/display/aiChatThreadDisplayedMessagesFamilyState';

const THROTTLE_MS = 100;

export const createAiChatStreamMessageFlusher = ({
  store,
  threadId,
  isInactive,
  getApolloClient,
}: {
  store: ReturnType<typeof createStore>;
  threadId: string;
  isInactive: () => boolean;
  getApolloClient: () => ApolloClient;
}) => {
  const displayedMessagesAtom =
    aiChatThreadDisplayedMessagesFamilyState.atomFamily({ threadId });

  let throttleTimer: ReturnType<typeof setTimeout> | null = null;
  let latestMessage: ExtendedUIMessage | null = null;

  const flushLatestMessage = () => {
    const messageToFlush = latestMessage;

    if (isInactive() || !isDefined(messageToFlush)) {
      return;
    }

    store.set(displayedMessagesAtom, (currentMessages) =>
      upsertAiChatMessage(currentMessages, messageToFlush),
    );
    refetchToolIndexOnUnknownTools({
      apolloClient: getApolloClient(),
      messages: [messageToFlush],
    });
  };

  const clearThrottleTimer = () => {
    if (isDefined(throttleTimer)) {
      clearTimeout(throttleTimer);
      throttleTimer = null;
    }
  };

  return {
    schedule: (message: ExtendedUIMessage) => {
      latestMessage = message;

      if (!isDefined(throttleTimer)) {
        flushLatestMessage();

        throttleTimer = setTimeout(() => {
          throttleTimer = null;
          flushLatestMessage();
        }, THROTTLE_MS);
      }
    },
    flush: () => {
      clearThrottleTimer();
      flushLatestMessage();
    },
    cancel: () => {
      clearThrottleTimer();
      latestMessage = null;
    },
  };
};
