import { type Theme, useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { Trans } from '@lingui/react/macro';
import { IconLock } from 'twenty-ui/display';

const StyledContainer = styled.div<{ theme: Theme }>`
  align-items: center;
  display: inline-flex;

  background: ${({ theme }) => theme.background.transparent.light};
  color: ${({ theme }) => theme.font.color.tertiary};
  font-weight: ${({ theme }) => theme.font.weight.regular};
  font-size: ${({ theme }) => theme.font.size.md};
  padding: ${({ theme }) => theme.spacing(1)};
  gap: ${({ theme }) => theme.spacing(1)};

  border-radius: 4px;
`;

export const ForbiddenFieldDisplay = () => {
  const theme = useTheme();

  return (
    <StyledContainer theme={theme}>
      <IconLock size={theme.icon.size.sm} />
      <Trans>Not shared</Trans>
    </StyledContainer>
  );
};
