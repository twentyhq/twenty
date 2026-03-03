import { useContext } from 'react';
import { styled } from '@linaria/react';
import { Trans } from '@lingui/react/macro';
import { IconLock } from 'twenty-ui/display';
import { ThemeContext } from 'twenty-ui/theme';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledVisibilityCard = styled.div`
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.light};
  flex: 1;
  overflow: hidden;
  transition: color ${themeCssVariables.animation.duration.normal} ease;
  width: 100%;
`;

const StyledVisibilityCardContent = styled.div`
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
    <StyledVisibilityCard>
      <StyledVisibilityCardContent>
        <IconLock size={theme.icon.size.sm} />
        <Trans>Not shared</Trans>
      </StyledVisibilityCardContent>
    </StyledVisibilityCard>
  );
};
