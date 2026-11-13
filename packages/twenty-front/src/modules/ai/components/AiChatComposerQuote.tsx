import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';

import { AiChatComposerQuotePreview } from '@/ai/components/AiChatComposerQuotePreview';
import { AiChatMessageAuthorResolver } from '@/ai/components/AiChatMessageAuthorResolver';
import { useAgentChatMessageAuthor } from '@/ai/hooks/useAgentChatMessageAuthor';
import { useIsOwnAgentChatMessage } from '@/ai/hooks/useIsOwnAgentChatMessage';
import { agentChatDisplayedThreadState } from '@/ai/states/agentChatDisplayedThreadState';
import { agentChatQuotedMessageIdFamilyState } from '@/ai/states/agentChatQuotedMessageIdFamilyState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { agentChatThreadMessageFamilySelector } from '@/ai/states/selectors/agentChatThreadMessageFamilySelector';
import { getAgentChatMessageQuoteExcerpt } from '@/ai/utils/getAgentChatMessageQuoteExcerpt';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const AiChatComposerQuote = () => {
  const { t } = useLingui();
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
  const isOwnQuotedMessage = useIsOwnAgentChatMessage(quotedMessage);

  // the displayed thread lags a switch until its messages load
  if (
    !isDefined(agentChatQuotedMessageId) ||
    agentChatDisplayedThread !== currentAiChatThread
  ) {
    return null;
  }

  const removeQuote = () => setAgentChatQuotedMessageId(null);

  if (!isDefined(quotedMessage) || !isDefined(quotedMessageAuthor)) {
    return (
      <AiChatComposerQuotePreview
        source={{ status: 'unavailable' }}
        onRemove={removeQuote}
      />
    );
  }

  return (
    <AiChatMessageAuthorResolver author={quotedMessageAuthor}>
      {(author) => (
        <AiChatComposerQuotePreview
          source={{
            status: 'available',
            authorName: isOwnQuotedMessage ? t`You` : author.name,
            excerpt: getAgentChatMessageQuoteExcerpt(quotedMessage),
          }}
          onRemove={removeQuote}
        />
      )}
    </AiChatMessageAuthorResolver>
  );
};
