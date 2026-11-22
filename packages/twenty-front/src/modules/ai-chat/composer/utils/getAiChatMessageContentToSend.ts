import { type ApolloClient } from '@apollo/client';
import { type createStore } from 'jotai';
import { isDefined } from 'twenty-shared/utils';

import { getAiChatMessageQuoteSource } from '@/ai-chat/composer/utils/getAiChatMessageQuoteSource';
import { prependAiChatQuoteToText } from '@/ai-chat/composer/utils/prependAiChatQuoteToText';
import { aiChatMessageAuthorLookupSelector } from '@/ai-chat/messages/states/selectors/aiChatMessageAuthorLookupSelector';
import { getAiChatMessageAuthor } from '@/ai-chat/messages/utils/getAiChatMessageAuthor';
import { aiChatComposerQuotedMessageIdFamilyState } from '@/ai-chat/states/composer/aiChatComposerQuotedMessageIdFamilyState';
import { aiChatThreadMessageFamilySelector } from '@/ai-chat/states/selectors/aiChatThreadMessageFamilySelector';
import { FindChatMessageAgentDocument } from '~/generated-metadata/graphql';

export const getAiChatMessageContentToSend = ({
  store,
  apolloClient,
  threadId,
  draftText,
}: {
  store: ReturnType<typeof createStore>;
  apolloClient: ApolloClient;
  threadId: string;
  draftText: string;
}) => {
  const quotedMessageId = store.get(
    aiChatComposerQuotedMessageIdFamilyState.atomFamily({ threadId }),
  );
  const quotedMessage = store.get(
    aiChatThreadMessageFamilySelector.selectorFamily({
      threadId,
      messageId: quotedMessageId,
    }),
  );

  if (!isDefined(quotedMessage)) {
    return { contentToSend: draftText, quotedMessageId };
  }

  const quotedAgentId = quotedMessage.metadata?.agentId;
  const quotedAgentName = isDefined(quotedAgentId)
    ? (apolloClient.cache.readQuery({
        query: FindChatMessageAgentDocument,
        variables: { id: quotedAgentId },
      })?.findOneAgent.label ?? undefined)
    : undefined;
  const quotedMessageSource = getAiChatMessageQuoteSource({
    message: quotedMessage,
    author: getAiChatMessageAuthor({
      message: quotedMessage,
      authorLookup: store.get(aiChatMessageAuthorLookupSelector.atom),
      agentName: quotedAgentName,
    }),
  });

  return {
    contentToSend: isDefined(quotedMessageSource)
      ? prependAiChatQuoteToText({
          text: draftText,
          authorName: quotedMessageSource.author.name,
          excerpt: quotedMessageSource.excerpt,
        })
      : draftText,
    quotedMessageId,
  };
};
