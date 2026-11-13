import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';

import { InboxComposerQuotePreview } from '@/ai/components/AiChatComposerQuotePreview';
import { InboxMessageAuthorResolver } from '@/ai/components/AiChatMessageAuthorResolver';
import { useInboxMessageAuthor } from '@/ai/hooks/useAgentChatMessageAuthor';
import { useIsOwnInboxMessage } from '@/ai/hooks/useIsOwnAgentChatMessage';
import { inboxDisplayedThreadState } from '@/ai/states/agentChatDisplayedThreadState';
import { inboxQuotedMessageIdFamilyState } from '@/ai/states/agentChatQuotedMessageIdFamilyState';
import { currentInboxThreadState } from '@/ai/states/currentAiChatThreadState';
import { inboxThreadMessageFamilySelector } from '@/ai/states/selectors/agentChatThreadMessageFamilySelector';
import { getInboxMessageQuoteExcerpt } from '@/ai/utils/getAgentChatMessageQuoteExcerpt';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const InboxComposerQuote = () => {
  const { t } = useLingui();
  const currentInboxThread = useAtomStateValue(currentInboxThreadState);
  const inboxDisplayedThread = useAtomStateValue(inboxDisplayedThreadState);
  const [inboxQuotedMessageId, setInboxQuotedMessageId] = useAtomFamilyState(
    inboxQuotedMessageIdFamilyState,
    {
      threadId: currentInboxThread,
    },
  );
  const quotedMessage = useAtomFamilySelectorValue(
    inboxThreadMessageFamilySelector,
    { threadId: inboxDisplayedThread, messageId: inboxQuotedMessageId },
  );
  const quotedMessageAuthor = useInboxMessageAuthor(quotedMessage);
  const isOwnQuotedMessage = useIsOwnInboxMessage(quotedMessage);

  // the displayed thread lags a switch until its messages load
  if (
    !isDefined(inboxQuotedMessageId) ||
    inboxDisplayedThread !== currentInboxThread
  ) {
    return null;
  }

  const removeQuote = () => setInboxQuotedMessageId(null);

  if (!isDefined(quotedMessage) || !isDefined(quotedMessageAuthor)) {
    return (
      <InboxComposerQuotePreview
        source={{ status: 'unavailable' }}
        onRemove={removeQuote}
      />
    );
  }

  return (
    <InboxMessageAuthorResolver author={quotedMessageAuthor}>
      {(author) => (
        <InboxComposerQuotePreview
          source={{
            status: 'available',
            authorName: isOwnQuotedMessage ? t`You` : author.name,
            excerpt: getInboxMessageQuoteExcerpt(quotedMessage),
          }}
          onRemove={removeQuote}
        />
      )}
    </InboxMessageAuthorResolver>
  );
};
