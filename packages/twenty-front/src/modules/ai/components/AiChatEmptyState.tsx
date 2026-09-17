import { StyledAiChatContentContainer } from '@/ai/components/StyledAiChatContentContainer';
import { styled } from '@linaria/react';
import { useContext } from 'react';

import { AiChatSuggestedPrompts } from '@/ai/components/suggested-prompts/AiChatSuggestedPrompts';
import { AI_CHAT_SURFACE } from '@/ai/constants/AiChatSurface';
import { AiChatSurfaceContext } from '@/ai/contexts/AiChatSurfaceContext';
import { useShouldShowAiChatEmptyState } from '@/ai/hooks/useShouldShowAiChatEmptyState';

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
  const aiChatSurface = useContext(AiChatSurfaceContext);

  // The channel feed already fills the page above its composer.
  if (
    !shouldShowAiChatEmptyState ||
    aiChatSurface === AI_CHAT_SURFACE.CHANNEL_PAGE
  ) {
    return null;
  }

  return (
    <StyledEmptyState>
      <AiChatSuggestedPrompts isCentered={isCentered} />
    </StyledEmptyState>
  );
};
