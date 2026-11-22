import { type ApolloClient } from '@apollo/client';
import { type createStore } from 'jotai';
import { mapAgentMessagesToUIMessages } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import { refetchToolIndexOnUnknownTools } from '@/ai-chat/instance/utils/refetchToolIndexOnUnknownTools';
import { aiChatMessageReactionRevisionsFamilyState } from '@/ai-chat/states/server/aiChatMessageReactionRevisionsFamilyState';
import { aiChatMessageReactionsFamilyState } from '@/ai-chat/states/server/aiChatMessageReactionsFamilyState';
import { aiChatThreadFetchedMessagesFamilyState } from '@/ai-chat/states/server/aiChatThreadFetchedMessagesFamilyState';
import { type GetChatMessagesQuery } from '~/generated-metadata/graphql';

export const storeFetchedAiChatMessages = ({
  store,
  threadId,
  chatMessages,
  apolloClient,
}: {
  store: ReturnType<typeof createStore>;
  threadId: string;
  chatMessages: GetChatMessagesQuery['chatMessages'];
  apolloClient: ApolloClient;
}) => {
  const liveReactionRevisions = store.get(
    aiChatMessageReactionRevisionsFamilyState.atomFamily({ threadId }),
  );

  for (const message of chatMessages) {
    if (!isDefined(liveReactionRevisions[message.id])) {
      store.set(
        aiChatMessageReactionsFamilyState.atomFamily({
          messageId: message.id,
        }),
        message.reactions,
      );
    }
  }

  const uiMessages = mapAgentMessagesToUIMessages(chatMessages);

  refetchToolIndexOnUnknownTools({ apolloClient, messages: uiMessages });

  store.set(aiChatThreadFetchedMessagesFamilyState.atomFamily({ threadId }), {
    messages: uiMessages.filter((message) => message.status !== 'queued'),
    queuedMessages: uiMessages.filter((message) => message.status === 'queued'),
  });
};
