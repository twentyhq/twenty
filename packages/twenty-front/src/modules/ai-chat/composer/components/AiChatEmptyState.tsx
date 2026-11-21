import { MarkdownRenderer } from '@/ai-chat/message-content/components/MarkdownRenderer';
import { StyledAiChatContentContainer } from '@/ai-chat/components/StyledAiChatContentContainer';
import { styled } from '@linaria/react';

import { AiChatSuggestedPrompts } from '@/ai-chat/composer/components/AiChatSuggestedPrompts';
import { useShouldShowAiChatEmptyState } from '@/ai-chat/hooks/useShouldShowAiChatEmptyState';

const StyledEmptyState = styled(StyledAiChatContentContainer)`
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: flex-end;
`;

type AiChatEmptyStateProps = {
  isCentered?: boolean;
};

export const AiChatEmptyState = ({
  isCentered = false,
}: AiChatEmptyStateProps) => {
  const shouldShowAiChatEmptyState = useShouldShowAiChatEmptyState();

  MarkdownRenderer.preload();

  if (!shouldShowAiChatEmptyState) {
    return null;
  }

  return (
    <StyledEmptyState>
      <AiChatSuggestedPrompts isCentered={isCentered} />
    </StyledEmptyState>
  );
};
