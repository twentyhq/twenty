import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledColumn = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: ${themeCssVariables.spacing[1]};
`;

export const AdvancedFilterSidePanelColumn = StyledColumn;
