import { aiChatDisplayedThreadComponentState } from '@/ai/states/aiChatDisplayedThreadComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAiChatInstanceOrThrow } from '@/ai/hooks/useAiChatInstanceOrThrow';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';

import { AiChatComposerQuotePreview } from '@/ai/components/AiChatComposerQuotePreview';
import { AiChatMessageAuthorResolver } from '@/ai/components/AiChatMessageAuthorResolver';
import { useAiChatMessageAuthor } from '@/ai/hooks/useAiChatMessageAuthor';
import { useIsOwnAiChatMessage } from '@/ai/hooks/useIsOwnAiChatMessage';
import { aiChatQuotedMessageIdFamilyState } from '@/ai/states/aiChatQuotedMessageIdFamilyState';
import { aiChatThreadMessageFamilySelector } from '@/ai/states/selectors/aiChatThreadMessageFamilySelector';
import { getAiChatMessageQuoteExcerpt } from '@/ai/utils/getAiChatMessageQuoteExcerpt';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyState';

export const AiChatComposerQuote = () => {
  const { t } = useLingui();
  const { threadId: currentAiChatThread } = useAiChatInstanceOrThrow();
  const aiChatDisplayedThread = useAtomComponentStateValue(
    aiChatDisplayedThreadComponentState,
  );
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
