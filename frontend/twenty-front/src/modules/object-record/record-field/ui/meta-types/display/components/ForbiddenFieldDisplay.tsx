import { styled } from '@linaria/react';
import { Trans } from '@lingui/react/macro';
import { useContext } from 'react';
import { IconLock } from 'twenty-ui/display';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

const StyledContainer = styled.div`
  align-items: center;
  background: ${themeCssVariables.background.transparent.light};

  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.tertiary};
  display: inline-flex;
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.regular};
  gap: ${themeCssVariables.spacing[1]};
  height: ${themeCssVariables.spacing[3]};
  overflow: hidden;

  padding: ${themeCssVariables.spacing[1]};
  user-select: none;
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
