import { ReactNode } from 'react';
import styled from '@emotion/styled';

type TableCellProps = {
  children?: ReactNode;
  className?: string;
};

const StyledTableCell = styled.div<{ isNumberCell: boolean }>`
  align-items: center;
  color: ${({ theme }) => theme.font.color.secondary};
  display: flex;
  height: ${({ theme }) => theme.spacing(8)};
  justify-content: ${({ isNumberCell }) =>
    isNumberCell ? 'flex-end' : 'flex-start'};
  padding: 0 ${({ theme }) => theme.spacing(2)};
  text-align: ${({ isNumberCell }) => (isNumberCell ? 'right' : 'left')};
`;

export const TableCell = ({ children, className }: TableCellProps) => {
  return (
    <StyledTableCell
      className={className}
      isNumberCell={
        typeof children === 'number' ||
        (typeof children === 'string' && !isNaN(+children))
      }
    >
      {children}
    </StyledTableCell>
  );
};
