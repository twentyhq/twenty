import styled from '@emotion/styled';

export const StyledTableDiv = styled.div`
  border-radius: ${({ theme }) => theme.border.radius.sm};
  border-spacing: 0;
  width: 100%;

  .footer-sticky tr:nth-last-of-type(2) td {
    border-bottom-color: ${({ theme }) => theme.background.transparent};
  }
`;
