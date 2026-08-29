import { styled } from '@linaria/react';
import { type Editor } from '@tiptap/react';

import { AiChatSuggestedPrompts } from '@/ai/components/suggested-prompts/AiChatSuggestedPrompts';
import { useShouldShowAiChatEmptyState } from '@/ai/hooks/useShouldShowAiChatEmptyState';

const StyledEmptyState = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: flex-end;
`;

type AiChatEmptyStateProps = {
  editor: Editor | null;
  isCentered?: boolean;
};

export const AiChatEmptyState = ({
  editor,
  isCentered = false,
}: AiChatEmptyStateProps) => {
  const shouldShowAiChatEmptyState = useShouldShowAiChatEmptyState();

  if (!shouldShowAiChatEmptyState) {
    return null;
  }

  return (
    <StyledEmptyState>
      <AiChatSuggestedPrompts editor={editor} isCentered={isCentered} />
    </StyledEmptyState>
  );
};
