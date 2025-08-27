import { ViewBarFilterDropdownAdvancedFilterButton } from '@/views/components/ViewBarFilterDropdownAdvancedFilterButton';
import { ViewBarFilterDropdownAnyFieldSearchButton } from '@/views/components/ViewBarFilterDropdownAnyFieldSearchButton';
import styled from '@emotion/styled';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing(1)};
`;

export const ViewBarFilterDropdownBottomMenu = () => {
  return (
    <StyledContainer>
      <ViewBarFilterDropdownAnyFieldSearchButton />
      <ViewBarFilterDropdownAdvancedFilterButton />
    </StyledContainer>
  );
};
