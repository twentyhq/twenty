import { ChartTypeSelectionSection } from '@/command-menu/pages/page-layout/components/ChartTypeSelectionSection';
import styled from '@emotion/styled';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${({ theme }) => theme.spacing(1)} ${({ theme }) => theme.spacing(2)};
`;

export const CommandMenuPageLayoutGraphTypeSelect = () => {
  return (
    <StyledContainer>
      <ChartTypeSelectionSection />
    </StyledContainer>
  );
};
