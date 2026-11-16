import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type KeyboardEvent } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';

import { AiChatQuotedMessagePreview } from '@/ai/components/AiChatQuotedMessagePreview';
import { useIsOwnAiChatMessage } from '@/ai/hooks/useIsOwnAiChatMessage';
import { aiChatDisplayedThreadState } from '@/ai/states/aiChatDisplayedThreadState';
import { aiChatThreadMessageFamilySelector } from '@/ai/states/selectors/aiChatThreadMessageFamilySelector';
import { aiChatReplyQuotedMessageIdFamilySelector } from '@/ai/states/selectors/aiChatReplyQuotedMessageIdFamilySelector';
import { type AiChatMessageQuote } from '@/ai/types/AiChatMessageQuote';
import { scrollToAiChatMessage } from '@/ai/utils/scrollToAiChatMessage';
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
  quote: AiChatMessageQuote;
};

export const AiChatMessageReplyQuote = ({
  replyMessageId,
  quote,
}: AiChatMessageReplyQuoteProps) => {
  const { t } = useLingui();
  const aiChatDisplayedThread = useAtomStateValue(aiChatDisplayedThreadState);
  const quotedMessageId = useAtomFamilySelectorValue(
    aiChatReplyQuotedMessageIdFamilySelector,
    { replyMessageId },
  );
  const quotedMessage = useAtomFamilySelectorValue(
    aiChatThreadMessageFamilySelector,
    { threadId: aiChatDisplayedThread, messageId: quotedMessageId },
  );
  const isOwnQuotedMessage = useIsOwnAiChatMessage(quotedMessage);
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
      scrollToAiChatMessage(quotedMessageId);
    }
  };

  return (
    <StyledReplyLine
      isClickable
      role="button"
      tabIndex={0}
      aria-label={t`View original message`}
      onClick={() => scrollToAiChatMessage(quotedMessageId)}
      onKeyDown={handleKeyDown}
    >
      {preview}
    </StyledReplyLine>
  );
};
