import { styled } from '@linaria/react';
import { Trans } from '@lingui/react/macro';
import { useContext } from 'react';
import { IconLock } from 'twenty-ui/display';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

const StyledContainer = styled.div`
  align-items: center;
  background: ${themeCssVariables.background.transparent.light};

  border-radius: 4px;
  color: ${themeCssVariables.font.color.tertiary};
  display: inline-flex;
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.regular};
  gap: ${themeCssVariables.spacing[1]};

  padding: ${themeCssVariables.spacing[1]};
`;

export const ForbiddenFieldDisplay = () => {
  const { theme } = useContext(ThemeContext);

  return (
    <StyledContainer>
      <IconLock size={theme.icon.size.sm} />
      <Trans>Not shared</Trans>
    </StyledContainer>
  );
};
