import styled from '@emotion/styled';

export const StyledPropertyBoxContainer = styled.div`
  align-self: stretch;
  background: ${({ theme }) => theme.background.secondary};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(3)};
`;

export { StyledPropertyBoxContainer as PropertyBoxContainer };
