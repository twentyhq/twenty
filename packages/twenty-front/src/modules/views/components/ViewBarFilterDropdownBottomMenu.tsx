import { ViewBarFilterDropdownAdvancedFilterButton } from '@/views/components/ViewBarFilterDropdownAdvancedFilterButton';
import { ViewBarFilterDropdownAnyFieldSearchButton } from '@/views/components/ViewBarFilterDropdownAnyFieldSearchButton';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: ${themeCssVariables.spacing[1]};
`;

export const ViewBarFilterDropdownBottomMenu = () => {
  return (
    <StyledContainer>
      <ViewBarFilterDropdownAnyFieldSearchButton />
      <ViewBarFilterDropdownAdvancedFilterButton />
    </StyledContainer>
  );
};
