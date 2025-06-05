import { Theme, useTheme } from '@emotion/react';
import styled from '@emotion/styled';

const StyledContainer = styled.div<{ theme: Theme }>`
  align-items: center;
  display: flex;

  background: ${({ theme }) => theme.background.transparent.lighter};
  color: ${({ theme }) => theme.font.color.tertiary};
  font-weight: ${({ theme }) => theme.font.weight.regular};
  font-size: ${({ theme }) => theme.font.size.sm};
  padding: ${({ theme }) => theme.spacing(1, 2)};

  border-radius: 4px;
  border: 1px solid ${({ theme }) => theme.border.color.light};
`;

export const ForbiddenFieldDisplay = () => {
  const theme = useTheme();

  return <StyledContainer theme={theme}>Forbidden</StyledContainer>;
};
