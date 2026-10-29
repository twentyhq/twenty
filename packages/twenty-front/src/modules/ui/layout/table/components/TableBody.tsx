import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme';

type TableBodyProps = {
  padding?: string;
  hasTopBorder?: boolean;
};

const StyledTableBody = styled.div<TableBodyProps>`
  border-top: ${({ hasTopBorder }) =>
    hasTopBorder
      ? `1px solid ${themeCssVariables.border.color.light}`
      : 'none'};
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: ${({ padding }) => padding ?? `${themeCssVariables.spacing[2]} 0`};
`;

export { StyledTableBody as TableBody };
