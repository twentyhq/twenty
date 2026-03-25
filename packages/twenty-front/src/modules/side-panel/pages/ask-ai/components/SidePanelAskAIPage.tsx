import { styled } from '@linaria/react';
import { AIChatTab } from '@/ai/components/AIChatTab';

const StyledContainer = styled.div`
  height: 100%;
  width: 100%;
`;

export const SidePanelAskAIPage = () => {
  return (
    <StyledContainer>
      <AIChatTab />
    </StyledContainer>
  );
};
