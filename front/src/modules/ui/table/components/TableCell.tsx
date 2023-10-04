import { PropsWithChildren } from 'react';
import styled from '@emotion/styled';

const StyledTableCell = styled.td`
  padding: 0 ${({ theme }) => theme.spacing(2)};
`;

const StyledTableCellContent = styled.div`
  align-items: center;
  display: flex;
  height: ${({ theme }) => theme.spacing(8)};
`;

export const TableCell = ({ children }: PropsWithChildren) => (
  <StyledTableCell>
    <StyledTableCellContent>{children}</StyledTableCellContent>
  </StyledTableCell>
);
