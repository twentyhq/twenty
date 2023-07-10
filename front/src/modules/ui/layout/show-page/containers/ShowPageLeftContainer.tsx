import styled from '@emotion/styled';

export const ShowPageLeftContainer = styled.div`
  background: ${({ theme }) => theme.background.secondary};
  border-radius: 8px;
  border-right: 1px solid ${({ theme }) => theme.border.color.light};
  padding: 0px ${({ theme }) => theme.spacing(3)};
  width: 320px;
`;
