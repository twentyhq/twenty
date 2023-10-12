import styled from '@emotion/styled';

const StyledTableCell = styled.div<{ align?: 'left' | 'center' | 'right' }>`
  align-items: center;
  color: ${({ theme }) => theme.font.color.secondary};
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
