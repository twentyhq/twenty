import styled from '@emotion/styled';

export const StyledTable = styled.table`
  border-radius: ${({ theme }) => theme.border.radius.sm};
  border-spacing: 0;
  table-layout: fixed;
  width: 100%;

  .footer-sticky tr:nth-last-of-type(2) td {
    border-bottom-color: ${({ theme }) => theme.background.transparent};
  }
`;
