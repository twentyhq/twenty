import { styled } from '@linaria/react';
import { Trans } from '@lingui/react/macro';
import { IconLock } from 'twenty-ui/display';
import { Card, CardContent } from 'twenty-ui/layout';
import {
  resolveThemeVariableAsNumber,
  themeCssVariables,
} from 'twenty-ui/theme-constants';

const StyledVisibilityCardContainer = styled.div`
  flex: 1;
  width: 100%;

  > div {
    color: ${themeCssVariables.font.color.light};
    border-color: ${themeCssVariables.border.color.light};
    transition: color ${themeCssVariables.animation.duration.normal} ease;
  }
`;

const StyledVisibilityCardContentContainer = styled.div`
  > div {
    align-items: center;
    background-color: ${themeCssVariables.background.transparent.lighter};
    box-sizing: border-box;
    display: flex;
    font-size: ${themeCssVariables.font.size.sm};
    font-weight: ${themeCssVariables.font.weight.medium};
    gap: ${themeCssVariables.spacing[1]};
    height: ${themeCssVariables.spacing[6]};
    padding: ${themeCssVariables.spacing[0]} ${themeCssVariables.spacing[1]};
  }
`;

export const CalendarEventNotSharedContent = () => {
  return (
    <StyledVisibilityCardContainer>
      <Card>
        <StyledVisibilityCardContentContainer>
          <CardContent>
            <IconLock
              size={resolveThemeVariableAsNumber(
                themeCssVariables.icon.size.sm,
              )}
            />
            <Trans>Not shared</Trans>
          </CardContent>
        </StyledVisibilityCardContentContainer>
      </Card>
    </StyledVisibilityCardContainer>
  );
};
