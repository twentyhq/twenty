import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui-deprecated/theme-constants';

const StyledColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  width: 100%;
`;

export const AdvancedFilterSidePanelColumn = StyledColumn;
