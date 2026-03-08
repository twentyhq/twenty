import { AIChatThreadsList } from '@/ai/components/AIChatThreadsList';
import { styled } from '@linaria/react';

const StyledContainer = styled.div`
  height: 100%;
  width: 100%;
`;

export const SidePanelAIChatThreadsPage = () => {
  return (
    <StyledContainer>
      <AIChatThreadsList />
    </StyledContainer>
  );
};
