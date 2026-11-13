import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type KeyboardEvent } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';

import { InboxQuotedMessagePreview } from '@/ai/components/AiChatQuotedMessagePreview';
import { useIsOwnInboxMessage } from '@/ai/hooks/useIsOwnAgentChatMessage';
import { inboxDisplayedThreadState } from '@/ai/states/agentChatDisplayedThreadState';
import { inboxThreadMessageFamilySelector } from '@/ai/states/selectors/agentChatThreadMessageFamilySelector';
import { inboxReplyQuotedMessageIdFamilySelector } from '@/ai/states/selectors/agentChatReplyQuotedMessageIdFamilySelector';
import { type InboxMessageQuote } from '@/ai/types/AgentChatMessageQuote';
import { scrollToInboxMessage } from '@/ai/utils/scrollToAgentChatMessage';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

// width 0 with min-width 100% keeps the one-line excerpt from widening a fit-content bubble
const StyledReplyLine = styled.div<{ isClickable: boolean }>`
  border-radius: ${themeCssVariables.border.radius.sm};
  cursor: ${({ isClickable }) => (isClickable ? 'pointer' : 'default')};
  display: flex;
  margin-bottom: ${themeCssVariables.spacing[1]};
  min-width: 100%;
  width: 0;

  &:focus-visible {
    outline: 2px solid ${themeCssVariables.color.blue};
    outline-offset: ${themeCssVariables.spacing[0.5]};
  }
`;

type InboxMessageReplyQuoteProps = {
  replyMessageId: string;
  quote: InboxMessageQuote;
};

export const InboxMessageReplyQuote = ({
  replyMessageId,
  quote,
}: InboxMessageReplyQuoteProps) => {
  const { t } = useLingui();
  const inboxDisplayedThread = useAtomStateValue(inboxDisplayedThreadState);
  const quotedMessageId = useAtomFamilySelectorValue(
    inboxReplyQuotedMessageIdFamilySelector,
    { replyMessageId },
  );
  const quotedMessage = useAtomFamilySelectorValue(
    inboxThreadMessageFamilySelector,
    { threadId: inboxDisplayedThread, messageId: quotedMessageId },
  );
  const isOwnQuotedMessage = useIsOwnInboxMessage(quotedMessage);
  const authorName = isOwnQuotedMessage ? t`You` : quote.authorName;

  const preview = (
    <InboxQuotedMessagePreview
      source={{ status: 'available', authorName, excerpt: quote.excerpt }}
    />
  );

  if (!isDefined(quotedMessageId)) {
    return <StyledReplyLine isClickable={false}>{preview}</StyledReplyLine>;
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      scrollToInboxMessage(quotedMessageId);
    }
  };

  return (
    <StyledReplyLine
      isClickable
      role="button"
      tabIndex={0}
      aria-label={t`View original message`}
      onClick={() => scrollToInboxMessage(quotedMessageId)}
      onKeyDown={handleKeyDown}
    >
      {preview}
    </StyledReplyLine>
  );
};
