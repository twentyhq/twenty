import styled from '@emotion/styled';

type TableCellProps = {
  align?: 'left' | 'center' | 'right';
  color?: string;
};

const StyledTableCell = styled.div<TableCellProps>`
  align-items: center;
  color: ${({ color, theme }) => color || theme.font.color.secondary};
  display: flex;
  height: ${({ theme }) => theme.spacing(8)};
  justify-content: ${({ align }) =>
    align === 'right'
      ? 'flex-end'
      : align === 'center'
        ? 'center'
        : 'flex-start'};
  padding: 0 ${({ theme }) => theme.spacing(2)};
  text-align: ${({ align }) => align ?? 'left'};
`;

export { StyledTableCell as TableCell };
