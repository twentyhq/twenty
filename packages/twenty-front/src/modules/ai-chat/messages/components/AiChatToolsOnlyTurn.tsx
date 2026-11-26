import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { type ExtendedUIMessage } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';

import { AiChatMessageAuthorAvatar } from '@/ai-chat/messages/components/AiChatMessageAuthorAvatar';
import { AiChatMessageAuthorResolver } from '@/ai-chat/messages/components/AiChatMessageAuthorResolver';
import { useAiChatMessageAuthor } from '@/ai-chat/messages/hooks/useAiChatMessageAuthor';
import { StyledChatMessageBubble } from '@/chat/components/StyledChatMessageBubble';
import { CHAT_MESSAGE_HEADER_BOTTOM_MARGIN } from '@/chat/constants/ChatMessageHeaderBottomMargin';
import { CHAT_MESSAGE_HEADER_HEIGHT } from '@/chat/constants/ChatMessageHeaderHeight';

const StyledToolsOnlyTurn = styled.div<{ hasTrailingSpace: boolean }>`
  align-items: flex-start;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  margin-bottom: ${({ hasTrailingSpace }) =>
    hasTrailingSpace
      ? `calc(${CHAT_MESSAGE_HEADER_HEIGHT} + ${CHAT_MESSAGE_HEADER_BOTTOM_MARGIN})`
      : '0'};
`;

const StyledAvatar = styled.div`
  align-items: center;
  display: flex;
  flex-shrink: 0;
  height: ${themeCssVariables.spacing[6]};
`;

const StyledContent = styled.div`
  flex: 1;
  min-width: 0;
`;

type AiChatToolsOnlyTurnProps = {
  message: Pick<ExtendedUIMessage, 'id' | 'role' | 'metadata'>;
  hasTrailingSpace: boolean;
  children: ReactNode;
};

export const AiChatToolsOnlyTurn = ({
  message,
  hasTrailingSpace,
  children,
}: AiChatToolsOnlyTurnProps) => {
  const author = useAiChatMessageAuthor(message);

  return (
    <StyledToolsOnlyTurn hasTrailingSpace={hasTrailingSpace}>
      <StyledAvatar>
        {isDefined(author) && (
          <AiChatMessageAuthorResolver author={author}>
            {(resolvedAuthor) => (
              <AiChatMessageAuthorAvatar author={resolvedAuthor} />
            )}
          </AiChatMessageAuthorResolver>
        )}
      </StyledAvatar>
      <StyledContent>
        <StyledChatMessageBubble>{children}</StyledChatMessageBubble>
      </StyledContent>
    </StyledToolsOnlyTurn>
  );
};
