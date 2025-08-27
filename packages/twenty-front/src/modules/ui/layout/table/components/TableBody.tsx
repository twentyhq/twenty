import styled from '@emotion/styled';

const StyledTableBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: ${({ theme }) => theme.spacing(2)} 0;
`;

export { StyledTableBody as TableBody };
