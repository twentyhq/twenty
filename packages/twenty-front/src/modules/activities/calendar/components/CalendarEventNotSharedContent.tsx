import { styled } from '@linaria/react';
import { Trans } from '@lingui/react/macro';
import { useContext } from 'react';
import { IconLock } from 'twenty-ui/display';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

const StyledContainer = styled.div`
  align-items: center;
  background: ${themeCssVariables.background.transparent.lighter};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.sm};
  box-sizing: border-box;
  color: ${themeCssVariables.font.color.light};
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
  gap: ${themeCssVariables.spacing[1]};
  height: ${themeCssVariables.spacing[6]};
  padding: ${themeCssVariables.spacing[0]} ${themeCssVariables.spacing[1]};
  width: 100%;
`;

export const CalendarEventNotSharedContent = () => {
  const { theme } = useContext(ThemeContext);

  return (
    <StyledContainer>
      <IconLock size={theme.icon.size.sm} />
      <Trans>Not shared</Trans>
    </StyledContainer>
  );
};
