import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type KeyboardEvent } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';

import { AiChatMessageReplyQuoteAvatar } from '@/ai/components/AiChatMessageReplyQuoteAvatar';
import { AiChatQuotedMessagePreview } from '@/ai/components/AiChatQuotedMessagePreview';
import { useAgentChatMessageAuthor } from '@/ai/hooks/useAgentChatMessageAuthor';
import { agentChatDisplayedThreadState } from '@/ai/states/agentChatDisplayedThreadState';
import { agentChatThreadMessageFamilySelector } from '@/ai/states/selectors/agentChatThreadMessageFamilySelector';
import { agentChatReplyQuotedMessageIdFamilySelector } from '@/ai/states/selectors/agentChatReplyQuotedMessageIdFamilySelector';
import { type AgentChatMessageQuote } from '@/ai/types/AgentChatMessageQuote';
import { scrollToAgentChatMessage } from '@/ai/utils/scrollToAgentChatMessage';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

const StyledQuoteContainer = styled.div<{ isClickable: boolean }>`
  border-radius: ${themeCssVariables.border.radius.sm};
  cursor: ${({ isClickable }) => (isClickable ? 'pointer' : 'default')};
  display: flex;
  margin-bottom: ${themeCssVariables.spacing[2]};

  &:hover {
    background: ${({ isClickable }) =>
      isClickable ? themeCssVariables.background.transparent.light : 'none'};
  }

  &:focus-visible {
    outline: 2px solid ${themeCssVariables.color.blue};
    outline-offset: ${themeCssVariables.spacing[0.5]};
  }
`;

type AiChatMessageReplyQuoteProps = {
  replyMessageId: string;
  quote: AgentChatMessageQuote;
};

export const AiChatMessageReplyQuote = ({
  replyMessageId,
  quote,
}: AiChatMessageReplyQuoteProps) => {
  const { t } = useLingui();
  const agentChatDisplayedThread = useAtomStateValue(
    agentChatDisplayedThreadState,
  );
  const quotedMessageId = useAtomFamilySelectorValue(
    agentChatReplyQuotedMessageIdFamilySelector,
    { replyMessageId },
  );
  const quotedMessage = useAtomFamilySelectorValue(
    agentChatThreadMessageFamilySelector,
    { threadId: agentChatDisplayedThread, messageId: quotedMessageId },
  );
  const quotedMessageAuthor = useAgentChatMessageAuthor(quotedMessage);

  const preview = (
    <AiChatQuotedMessagePreview
      source={{
        status: 'available',
        authorName: quote.authorName,
        authorAvatar: (
          <AiChatMessageReplyQuoteAvatar
            quotedMessageAuthor={quotedMessageAuthor}
            quotedAuthorName={quote.authorName}
          />
        ),
        excerpt: quote.excerpt,
      }}
    />
  );

  if (!isDefined(quotedMessageId)) {
    return (
      <StyledQuoteContainer isClickable={false}>{preview}</StyledQuoteContainer>
    );
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) {
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      scrollToAgentChatMessage(quotedMessageId);
    }
  };

  return (
    <StyledQuoteContainer
      isClickable
      role="button"
      tabIndex={0}
      aria-label={t`View original message`}
      onClick={() => scrollToAgentChatMessage(quotedMessageId)}
      onKeyDown={handleKeyDown}
    >
      {preview}
    </StyledQuoteContainer>
  );
};
