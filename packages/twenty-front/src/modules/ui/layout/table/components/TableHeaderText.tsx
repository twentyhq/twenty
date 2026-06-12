import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui-deprecated/theme-constants';

const StyledTableHeaderText = styled.div`
  padding-bottom: ${themeCssVariables.spacing['0.5']};
`;

export { StyledTableHeaderText as TableHeaderText };
