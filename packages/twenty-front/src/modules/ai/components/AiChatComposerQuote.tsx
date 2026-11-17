import { useAiChatInstanceOrThrow } from '@/ai/hooks/useAiChatInstanceOrThrow';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';

import { AiChatComposerQuotePreview } from '@/ai/components/AiChatComposerQuotePreview';
import { AiChatMessageAuthorResolver } from '@/ai/components/AiChatMessageAuthorResolver';
import { useAiChatMessageAuthor } from '@/ai/hooks/useAiChatMessageAuthor';
import { useIsOwnAiChatMessage } from '@/ai/hooks/useIsOwnAiChatMessage';
import { aiChatQuotedMessageIdFamilyState } from '@/ai/states/aiChatQuotedMessageIdFamilyState';
import { aiChatHasMessageFamilySelector } from '@/ai/states/selectors/aiChatHasMessageFamilySelector';
import { aiChatThreadMessageFamilySelector } from '@/ai/states/selectors/aiChatThreadMessageFamilySelector';
import { getAiChatMessageQuoteExcerpt } from '@/ai/utils/getAiChatMessageQuoteExcerpt';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyState';

export const AiChatComposerQuote = () => {
  const { t } = useLingui();
  const { threadId } = useAiChatInstanceOrThrow();
  const [aiChatQuotedMessageId, setAiChatQuotedMessageId] = useAtomFamilyState(
    aiChatQuotedMessageIdFamilyState,
    {
      threadId,
    },
  );
  const quotedMessage = useAtomFamilySelectorValue(
    aiChatThreadMessageFamilySelector,
    { threadId, messageId: aiChatQuotedMessageId },
  );
  const aiChatHasMessage = useAtomFamilySelectorValue(
    aiChatHasMessageFamilySelector,
    threadId,
  );
  const quotedMessageAuthor = useAiChatMessageAuthor(quotedMessage);
  const isOwnQuotedMessage = useIsOwnAiChatMessage(quotedMessage);

  if (!isDefined(aiChatQuotedMessageId) || !aiChatHasMessage) {
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
