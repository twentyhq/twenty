import { TooltipDelay } from '@/ui/layout/tooltip/constants/TooltipDelay';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { IconFilterOff } from 'twenty-ui/icon';
import { Tooltip } from 'twenty-ui/primitives/surfaces';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

const StyledIndicator = styled.span`
  align-items: center;
  color: ${themeCssVariables.font.color.light};
  display: flex;
`;

export const DashboardFilterUnaffectedWidgetIndicator = () => {
  const theme = useTheme();

  const label = t`Not affected by dashboard filters`;

  return (
    <Tooltip content={label} delay={TooltipDelay.shortDelay}>
      <StyledIndicator aria-label={label} role="img">
        <IconFilterOff
          size={theme.icon.size.sm}
          stroke={theme.icon.stroke.sm}
        />
      </StyledIndicator>
    </Tooltip>
  );
};
