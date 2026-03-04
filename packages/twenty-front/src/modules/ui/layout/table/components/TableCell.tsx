import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

type TableCellProps = {
  align?: 'left' | 'center' | 'right';
  color?: string;
  gap?: string;
  minWidth?: string;
  overflow?: string;
};

const StyledTableCell = styled.div<TableCellProps>`
  align-items: center;
  color: ${({ color }) => color || themeCssVariables.font.color.secondary};
  display: flex;
  gap: ${({ gap }) => gap ?? 'normal'};
  height: ${themeCssVariables.spacing[8]};
  justify-content: ${({ align }) =>
    align === 'right'
      ? 'flex-end'
      : align === 'center'
        ? 'center'
        : 'flex-start'};
  min-width: ${({ minWidth }) => minWidth ?? 'auto'};
  overflow: ${({ overflow }) => overflow ?? 'visible'};
  padding: 0 ${themeCssVariables.spacing[2]};
  text-align: ${({ align }) => align ?? 'left'};
`;

export { StyledTableCell as TableCell };
