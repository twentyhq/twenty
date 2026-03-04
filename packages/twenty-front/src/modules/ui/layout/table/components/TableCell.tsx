import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

type TableCellProps = {
  align?: 'left' | 'center' | 'right';
  color?: string;
};

const StyledTableCell = styled.div<TableCellProps>`
  align-items: center;
  color: ${({ color }) => color || themeCssVariables.font.color.secondary};
  display: flex;
  height: ${themeCssVariables.spacing[8]};
  justify-content: ${({ align }) =>
    align === 'right'
      ? 'flex-end'
      : align === 'center'
        ? 'center'
        : 'flex-start'};
  padding: 0 ${themeCssVariables.spacing[2]};
  text-align: ${({ align }) => align ?? 'left'};
`;

export { StyledTableCell as TableCell };
