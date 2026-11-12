import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type KeyboardEvent } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { Avatar } from 'twenty-ui/primitives/data-display';
import { themeCssVariables } from 'twenty-ui/theme';

import { AiChatQuotedMessagePreview } from '@/ai/components/AiChatQuotedMessagePreview';
import { agentChatDisplayedThreadState } from '@/ai/states/agentChatDisplayedThreadState';
import { agentChatMessageQuoteSourceFamilySelector } from '@/ai/states/selectors/agentChatMessageQuoteSourceFamilySelector';
import { agentChatReplyQuotedMessageIdFamilySelector } from '@/ai/states/selectors/agentChatReplyQuotedMessageIdFamilySelector';
import { type AgentChatMessageQuote } from '@/ai/types/AgentChatMessageQuote';
import { scrollToAgentChatMessage } from '@/ai/utils/scrollToAgentChatMessage';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';

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
    outline-offset: 2px;
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
  const quotedMessageSource = useAtomFamilySelectorValue(
    agentChatMessageQuoteSourceFamilySelector,
    { threadId: agentChatDisplayedThread, messageId: quotedMessageId },
  );
  const sender = quotedMessageSource?.sender;

  const preview = (
    <AiChatQuotedMessagePreview
      source={{
        status: 'available',
        authorName: quote.authorName,
        authorAvatar: (
          <Avatar
            name={quote.authorName}
            colorSeed={sender?.id}
            src={getAbsoluteImageUrl(sender?.avatarUrl)}
            size="sm"
            shape="circle"
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
