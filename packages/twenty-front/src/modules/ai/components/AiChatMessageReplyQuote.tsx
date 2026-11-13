import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type KeyboardEvent } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';

import { AiChatQuotedMessagePreview } from '@/ai/components/AiChatQuotedMessagePreview';
import { useIsOwnAgentChatMessage } from '@/ai/hooks/useIsOwnAgentChatMessage';
import { agentChatDisplayedThreadState } from '@/ai/states/agentChatDisplayedThreadState';
import { agentChatThreadMessageFamilySelector } from '@/ai/states/selectors/agentChatThreadMessageFamilySelector';
import { agentChatReplyQuotedMessageIdFamilySelector } from '@/ai/states/selectors/agentChatReplyQuotedMessageIdFamilySelector';
import { type AgentChatMessageQuote } from '@/ai/types/AgentChatMessageQuote';
import { scrollToAgentChatMessage } from '@/ai/utils/scrollToAgentChatMessage';
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
  const isOwnQuotedMessage = useIsOwnAgentChatMessage(quotedMessage);
  const authorName = isOwnQuotedMessage ? t`You` : quote.authorName;

  const preview = (
    <AiChatQuotedMessagePreview
      source={{ status: 'available', authorName, excerpt: quote.excerpt }}
    />
  );

  if (!isDefined(quotedMessageId)) {
    return <StyledReplyLine isClickable={false}>{preview}</StyledReplyLine>;
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      scrollToAgentChatMessage(quotedMessageId);
    }
  };

  return (
    <StyledReplyLine
      isClickable
      role="button"
      tabIndex={0}
      aria-label={t`View original message`}
      onClick={() => scrollToAgentChatMessage(quotedMessageId)}
      onKeyDown={handleKeyDown}
    >
      {preview}
    </StyledReplyLine>
  );
};
