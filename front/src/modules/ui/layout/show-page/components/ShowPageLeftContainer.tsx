import styled from '@emotion/styled';

export const ShowPageLeftContainer = styled.div`
  background: ${({ theme }) => theme.background.secondary};
  border-bottom-left-radius: 8px;
  border-right: 1px solid ${({ theme }) => theme.border.color.light};
  border-top-left-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(3)};
  padding: 0px ${({ theme }) => theme.spacing(3)};
  width: 320px;
`;
