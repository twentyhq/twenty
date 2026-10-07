import { useIsWidgetUnaffectedByDashboardFilters } from '@/page-layout/dashboard-filters/hooks/useIsWidgetUnaffectedByDashboardFilters';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { TooltipDelay } from '@/ui/layout/tooltip/constants/TooltipDelay';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { IconFilterOff } from 'twenty-ui/icon';
import { Tooltip } from 'twenty-ui/primitives/surfaces';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

const StyledIndicator = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.light};
  display: flex;
  flex-shrink: 0;
`;

type DashboardFilterUnaffectedWidgetIndicatorProps = {
  widget: PageLayoutWidget;
};

export const DashboardFilterUnaffectedWidgetIndicator = ({
  widget,
}: DashboardFilterUnaffectedWidgetIndicatorProps) => {
  const { t } = useLingui();
  const theme = useTheme();

  const isUnaffectedByDashboardFilters =
    useIsWidgetUnaffectedByDashboardFilters(widget);

  if (!isUnaffectedByDashboardFilters) {
    return null;
  }

  const label = t`Not affected by dashboard filters`;

  return (
    <Tooltip delay={TooltipDelay.mediumDelay} content={label} side="top">
      <StyledIndicator role="img" aria-label={label}>
        <IconFilterOff
          size={theme.icon.size.sm}
          stroke={theme.icon.stroke.sm}
        />
      </StyledIndicator>
    </Tooltip>
  );
};
