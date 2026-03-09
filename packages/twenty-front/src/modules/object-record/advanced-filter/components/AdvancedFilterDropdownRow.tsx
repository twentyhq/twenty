import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledRow = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  width: 100%;
`;

export const AdvancedFilterDropdownRow = StyledRow;
