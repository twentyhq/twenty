import { isDefined } from 'twenty-shared/utils';

import { AiChatComposerQuotePreview } from '@/ai/components/AiChatComposerQuotePreview';
import { AiChatMessageAuthorAvatar } from '@/ai/components/AiChatMessageAuthorAvatar';
import { AiChatMessageAuthorResolver } from '@/ai/components/AiChatMessageAuthorResolver';
import { useAgentChatMessageAuthor } from '@/ai/hooks/useAgentChatMessageAuthor';
import { agentChatDisplayedThreadState } from '@/ai/states/agentChatDisplayedThreadState';
import { agentChatQuotedMessageIdFamilyState } from '@/ai/states/agentChatQuotedMessageIdFamilyState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { agentChatThreadMessageFamilySelector } from '@/ai/states/selectors/agentChatThreadMessageFamilySelector';
import { getAgentChatMessageQuoteSource } from '@/ai/utils/getAgentChatMessageQuoteSource';
import { scrollToAgentChatMessage } from '@/ai/utils/scrollToAgentChatMessage';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const AiChatComposerQuote = () => {
  const currentAiChatThread = useAtomStateValue(currentAiChatThreadState);
  const agentChatDisplayedThread = useAtomStateValue(
    agentChatDisplayedThreadState,
  );
  const [agentChatQuotedMessageId, setAgentChatQuotedMessageId] =
    useAtomFamilyState(agentChatQuotedMessageIdFamilyState, {
      threadId: currentAiChatThread,
    });
  const quotedMessage = useAtomFamilySelectorValue(
    agentChatThreadMessageFamilySelector,
    { threadId: agentChatDisplayedThread, messageId: agentChatQuotedMessageId },
  );
  const quotedMessageAuthor = useAgentChatMessageAuthor(quotedMessage);

  if (!isDefined(agentChatQuotedMessageId)) {
    return null;
  }

  const removeQuote = () => setAgentChatQuotedMessageId(null);

  if (!isDefined(quotedMessage) || !isDefined(quotedMessageAuthor)) {
    return (
      <AiChatComposerQuotePreview
        source={{ status: 'unavailable' }}
        onRemove={removeQuote}
        onNavigateToMessage={scrollToAgentChatMessage}
      />
    );
  }

  return (
    <AiChatMessageAuthorResolver author={quotedMessageAuthor}>
      {(author) => {
        const { messageId, excerpt } = getAgentChatMessageQuoteSource({
          message: quotedMessage,
          author,
        });

        return (
          <AiChatComposerQuotePreview
            source={{
              status: 'available',
              messageId,
              authorName: author.name,
              authorAvatar: <AiChatMessageAuthorAvatar author={author} />,
              excerpt,
            }}
            onRemove={removeQuote}
            onNavigateToMessage={scrollToAgentChatMessage}
          />
        );
      }}
    </AiChatMessageAuthorResolver>
  );
};
