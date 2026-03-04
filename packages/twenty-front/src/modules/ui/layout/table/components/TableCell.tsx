import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

type TableCellProps = {
  align?: 'left' | 'center' | 'right';
  color?: string;
  gap?: string;
  height?: string;
  maxWidth?: string;
  minWidth?: string;
  overflow?: string;
  padding?: string;
  textOverflow?: string;
  whiteSpace?: string;
  clickable?: boolean;
};

const StyledTableCell = styled.div<TableCellProps>`
  align-items: center;
  color: ${({ color }) => color || themeCssVariables.font.color.secondary};
  cursor: ${({ clickable }) => (clickable === true ? 'pointer' : 'default')};
  display: flex;
  gap: ${({ gap }) => gap ?? 'normal'};
  height: ${({ height }) => height ?? themeCssVariables.spacing[8]};
  justify-content: ${({ align }) =>
    align === 'right'
      ? 'flex-end'
      : align === 'center'
        ? 'center'
        : 'flex-start'};
  max-width: ${({ maxWidth }) => maxWidth ?? 'none'};
  min-width: ${({ minWidth }) => minWidth ?? 'auto'};
  overflow: ${({ overflow }) => overflow ?? 'visible'};
  padding: ${({ padding }) => padding ?? `0 ${themeCssVariables.spacing[2]}`};
  text-align: ${({ align }) => align ?? 'left'};
  text-overflow: ${({ textOverflow }) => textOverflow ?? 'clip'};
  white-space: ${({ whiteSpace }) => whiteSpace ?? 'normal'};
`;

export { StyledTableCell as TableCell };
