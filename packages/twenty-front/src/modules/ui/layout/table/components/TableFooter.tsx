import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledTableFooter = styled.div`
  border-top: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  justify-content: flex-end;
  padding: ${themeCssVariables.spacing[2]} 0;
`;

export { StyledTableFooter as TableFooter };
