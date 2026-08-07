import { styled } from '@linaria/react';

import { AiChatThreadsList } from '@/ai/components/AiChatThreadsList';

const StyledContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
`;

export const ExpandedAiChatDrawerThreads = () => (
  <StyledContainer>
    <AiChatThreadsList />
  </StyledContainer>
);
