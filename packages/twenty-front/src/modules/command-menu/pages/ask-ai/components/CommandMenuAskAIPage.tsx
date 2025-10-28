import { AIChatTab } from '@/ai/components/AIChatTab';
import styled from '@emotion/styled';

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
