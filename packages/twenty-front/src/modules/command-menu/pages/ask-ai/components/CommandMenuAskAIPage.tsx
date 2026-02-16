import styled from '@emotion/styled';
import { AIChatTab } from '@/ai/components/AIChatTab';

const StyledContainer = styled.div`
  height: 100%;
  width: 100%;
`;

export const CommandMenuAskAIPage = () => {
  return (
    <StyledContainer>
      <AIChatTab />
    </StyledContainer>
  );
};
