import styled from '@emotion/styled';

export const StyledBoard = styled.div`
  border-radius: ${({ theme }) => theme.spacing(2)};
  display: flex;
  flex: 1;
  flex-direction: row;
  padding-left: ${({ theme }) => theme.spacing(2)};
`;
