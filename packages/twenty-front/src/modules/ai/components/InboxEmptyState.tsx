import { MarkdownRenderer } from '@/ai/components/MarkdownRenderer';
import { StyledInboxContentContainer } from '@/ai/components/StyledInboxContentContainer';
import { styled } from '@linaria/react';

import { AiChatSuggestedPrompts } from '@/ai/components/suggested-prompts/AiChatSuggestedPrompts';
import { useShouldShowInboxEmptyState } from '@/ai/hooks/useShouldShowInboxEmptyState';

const StyledEmptyState = styled(StyledInboxContentContainer)`
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: flex-end;
`;

type InboxEmptyStateProps = {
  isCentered?: boolean;
};

export const InboxEmptyState = ({
  isCentered = false,
}: InboxEmptyStateProps) => {
  const shouldShowInboxEmptyState = useShouldShowInboxEmptyState();

  MarkdownRenderer.preload();

  if (!shouldShowInboxEmptyState) {
    return null;
  }

  return (
    <StyledEmptyState>
      <AiChatSuggestedPrompts isCentered={isCentered} />
    </StyledEmptyState>
  );
};
