import styled from '@emotion/styled';

export const RightDrawerBody = styled.div`
  display: flex;
  flex-direction: column;
  height: calc(100vh - ${({ theme }) => theme.spacing(10)});
  overflow: auto;
  position: relative;
`;
