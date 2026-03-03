import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledColumn = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: ${themeCssVariables.spacing[1]};
`;

export const AdvancedFilterCommandMenuColumn = StyledColumn;
