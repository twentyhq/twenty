import { styled } from '@linaria/react';
import { Trans } from '@lingui/react/macro';
import { useContext } from 'react';
import { IconLock } from 'twenty-ui/display';
import { Card, CardContent } from 'twenty-ui/layout';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

const StyledVisibilityCardContainer = styled.div`
  color: ${themeCssVariables.font.color.light};
  flex: 1;
  transition: color ${themeCssVariables.animation.duration.normal} ease;
  width: 100%;

  > * {
    border-color: ${themeCssVariables.border.color.light};
  }
`;

const StyledVisibilityCardContentContainer = styled.div`
  align-items: center;
  background-color: ${themeCssVariables.background.transparent.lighter};
  box-sizing: border-box;
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
  gap: ${themeCssVariables.spacing[1]};
  height: ${themeCssVariables.spacing[6]};
  padding: ${themeCssVariables.spacing[0]} ${themeCssVariables.spacing[1]};
`;

export const CalendarEventNotSharedContent = () => {
  const { theme } = useContext(ThemeContext);

  return (
    <StyledVisibilityCardContainer>
      <Card>
        <StyledVisibilityCardContentContainer>
          <CardContent>
            <IconLock size={theme.icon.size.sm} />
            <Trans>Not shared</Trans>
          </CardContent>
        </StyledVisibilityCardContentContainer>
      </Card>
    </StyledVisibilityCardContainer>
  );
};
