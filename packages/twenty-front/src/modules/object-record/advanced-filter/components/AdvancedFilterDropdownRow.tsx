import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledRow = styled.div`
  display: flex;
  width: 100%;
  gap: ${themeCssVariables.spacing[1]};
`;

export const AdvancedFilterDropdownRow = StyledRow;
