import styled from '@emotion/styled';
import { type Editor } from '@tiptap/react';

import { AIChatSuggestedPrompts } from '@/ai/components/suggested-prompts/AIChatSuggestedPrompts';

const StyledEmptyState = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  justify-content: flex-end;
  height: 100%;
`;

type AIChatEmptyStateProps = {
  editor: Editor | null;
};

export const AIChatEmptyState = ({ editor }: AIChatEmptyStateProps) => {
  return (
    <StyledEmptyState>
      <AIChatSuggestedPrompts editor={editor} />
    </StyledEmptyState>
  );
};
