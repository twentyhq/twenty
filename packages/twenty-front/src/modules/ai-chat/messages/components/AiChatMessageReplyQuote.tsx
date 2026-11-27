import { useAiChatInstanceOrThrow } from '@/ai-chat/hooks/useAiChatInstanceOrThrow';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type KeyboardEvent } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';

import { AiChatQuotedMessagePreview } from '@/ai-chat/messages/components/AiChatQuotedMessagePreview';
import { useIsOwnAiChatMessage } from '@/ai-chat/messages/hooks/useIsOwnAiChatMessage';
import { aiChatThreadMessageFamilySelector } from '@/ai-chat/states/selectors/aiChatThreadMessageFamilySelector';
import { aiChatReplyQuotedMessageIdFamilySelector } from '@/ai-chat/messages/states/selectors/aiChatReplyQuotedMessageIdFamilySelector';
import { type AiChatMessageQuote } from '@/ai-chat/messages/types/AiChatMessageQuote';
import { scrollToAiChatMessage } from '@/ai-chat/messages/utils/scrollToAiChatMessage';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';

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
  const { threadId } = useAiChatInstanceOrThrow();
  const quotedMessageId = useAtomFamilySelectorValue(
    aiChatReplyQuotedMessageIdFamilySelector,
    { threadId, replyMessageId },
  );
  const quotedMessage = useAtomFamilySelectorValue(
    aiChatThreadMessageFamilySelector,
    { threadId, messageId: quotedMessageId },
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
