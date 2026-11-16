import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';

import { AiChatComposerQuotePreview } from '@/ai/components/AiChatComposerQuotePreview';
import { AiChatMessageAuthorResolver } from '@/ai/components/AiChatMessageAuthorResolver';
import { useAiChatMessageAuthor } from '@/ai/hooks/useAiChatMessageAuthor';
import { useIsOwnAiChatMessage } from '@/ai/hooks/useIsOwnAiChatMessage';
import { aiChatDisplayedThreadState } from '@/ai/states/aiChatDisplayedThreadState';
import { aiChatQuotedMessageIdFamilyState } from '@/ai/states/aiChatQuotedMessageIdFamilyState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { aiChatThreadMessageFamilySelector } from '@/ai/states/selectors/aiChatThreadMessageFamilySelector';
import { getAiChatMessageQuoteExcerpt } from '@/ai/utils/getAiChatMessageQuoteExcerpt';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const AiChatComposerQuote = () => {
  const { t } = useLingui();
  const currentAiChatThread = useAtomStateValue(currentAiChatThreadState);
  const aiChatDisplayedThread = useAtomStateValue(aiChatDisplayedThreadState);
  const [aiChatQuotedMessageId, setAiChatQuotedMessageId] = useAtomFamilyState(
    aiChatQuotedMessageIdFamilyState,
    {
      threadId: currentAiChatThread,
    },
  );
  const quotedMessage = useAtomFamilySelectorValue(
    aiChatThreadMessageFamilySelector,
    { threadId: aiChatDisplayedThread, messageId: aiChatQuotedMessageId },
  );
  const quotedMessageAuthor = useAiChatMessageAuthor(quotedMessage);
  const isOwnQuotedMessage = useIsOwnAiChatMessage(quotedMessage);

  // the displayed thread lags a switch until its messages load
  if (
    !isDefined(aiChatQuotedMessageId) ||
    aiChatDisplayedThread !== currentAiChatThread
  ) {
    return null;
  }

  const removeQuote = () => setAiChatQuotedMessageId(null);

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
            excerpt: getAiChatMessageQuoteExcerpt(quotedMessage),
          }}
          onRemove={removeQuote}
        />
      )}
    </AiChatMessageAuthorResolver>
  );
};
