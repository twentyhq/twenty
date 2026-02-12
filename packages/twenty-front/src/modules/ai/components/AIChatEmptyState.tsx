import styled from '@emotion/styled';

import { AIChatSuggestedPrompts } from '@/ai/components/suggested-prompts/AIChatSuggestedPrompts';

const StyledEmptyState = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  justify-content: flex-end;
  height: 100%;
`;

export const AIChatEmptyState = () => {
  return (
    <StyledEmptyState>
      <AIChatSuggestedPrompts />
    </StyledEmptyState>
  );
};
