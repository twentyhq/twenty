import { useAiChatInstanceOrThrow } from '@/ai-chat/hooks/useAiChatInstanceOrThrow';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';

import { AiChatComposerQuotePreview } from '@/ai-chat/composer/components/AiChatComposerQuotePreview';
import { AiChatMessageAuthorResolver } from '@/ai-chat/messages/components/AiChatMessageAuthorResolver';
import { useAiChatMessageAuthor } from '@/ai-chat/messages/hooks/useAiChatMessageAuthor';
import { useIsOwnAiChatMessage } from '@/ai-chat/messages/hooks/useIsOwnAiChatMessage';
import { aiChatComposerQuotedMessageIdFamilyState } from '@/ai-chat/states/composer/aiChatComposerQuotedMessageIdFamilyState';
import { aiChatHasMessageFamilySelector } from '@/ai-chat/states/selectors/aiChatHasMessageFamilySelector';
import { aiChatThreadMessageFamilySelector } from '@/ai-chat/states/selectors/aiChatThreadMessageFamilySelector';
import { getAiChatMessageQuoteExcerpt } from '@/ai-chat/messages/utils/getAiChatMessageQuoteExcerpt';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyState';

export const AiChatComposerQuote = () => {
  const { t } = useLingui();
  const { threadId } = useAiChatInstanceOrThrow();
  const [aiChatComposerQuotedMessageId, setAiChatComposerQuotedMessageId] =
    useAtomFamilyState(aiChatComposerQuotedMessageIdFamilyState, {
      threadId,
    });
  const quotedMessage = useAtomFamilySelectorValue(
    aiChatThreadMessageFamilySelector,
    { threadId, messageId: aiChatComposerQuotedMessageId },
  );
  const aiChatHasMessage = useAtomFamilySelectorValue(
    aiChatHasMessageFamilySelector,
    threadId,
  );
  const quotedMessageAuthor = useAiChatMessageAuthor(quotedMessage);
  const isOwnQuotedMessage = useIsOwnAiChatMessage(quotedMessage);

  if (!isDefined(aiChatComposerQuotedMessageId) || !aiChatHasMessage) {
    return null;
  }

  const removeQuote = () => setAiChatComposerQuotedMessageId(null);

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
