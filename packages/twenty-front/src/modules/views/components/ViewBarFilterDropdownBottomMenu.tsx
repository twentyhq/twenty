import { ViewBarFilterDropdownAdvancedFilterButton } from '@/views/components/ViewBarFilterDropdownAdvancedFilterButton';
import { ViewBarFilterDropdownVectorSearchButton } from '@/views/components/ViewBarFilterDropdownVectorSearchButton';
import styled from '@emotion/styled';

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing(1)};
  display: flex;
  flex-direction: column;
`;

export const ViewBarFilterDropdownBottomMenu = () => {
  return (
    <StyledContainer>
      <ViewBarFilterDropdownVectorSearchButton />
      <ViewBarFilterDropdownAdvancedFilterButton />
    </StyledContainer>
  );
};
