import { useContext } from 'react';
import { styled } from '@linaria/react';
import { Trans } from '@lingui/react/macro';
import { IconLock } from 'twenty-ui/display';
import { Card, CardContent } from 'twenty-ui/layout';
import { ThemeContext } from 'twenty-ui/theme';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledVisibilityCard = styled(Card)`
  border-color: ${themeCssVariables.border.color.light};
  color: ${themeCssVariables.font.color.light};
  flex: 1;
  transition: color ${themeCssVariables.animation.duration.normal} ease;
  width: 100%;
`;

const StyledVisibilityCardContent = styled(CardContent)`
  align-items: center;
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  padding: ${themeCssVariables.spacing[0]} ${themeCssVariables.spacing[1]};
  height: ${themeCssVariables.spacing[6]};
  background-color: ${themeCssVariables.background.transparent.lighter};
`;

export const CalendarEventNotSharedContent = () => {
  const { theme } = useContext(ThemeContext);

  return (
    <StyledVisibilityCard>
      <StyledVisibilityCardContent>
        <IconLock size={theme.icon.size.sm} />
        <Trans>Not shared</Trans>
      </StyledVisibilityCardContent>
    </StyledVisibilityCard>
  );
};
