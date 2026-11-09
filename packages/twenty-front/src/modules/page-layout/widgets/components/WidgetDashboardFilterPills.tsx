import { type WidgetDashboardFilterIndicator } from '@/page-layout/types/WidgetDashboardFilterIndicator';
import { TooltipDelay } from '@/ui/layout/tooltip/constants/TooltipDelay';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { IconFilter, IconFilterOff } from 'twenty-ui/icon';
import { Tooltip } from 'twenty-ui/primitives/surfaces';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

const StyledPill = styled.div`
  align-items: center;
  background: ${themeCssVariables.background.transparent.lighter};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.sm};
  box-sizing: border-box;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  flex-shrink: 1;
  font-size: ${themeCssVariables.font.size.sm};
  gap: ${themeCssVariables.spacing[1]};
  height: 20px;
  min-width: 0;
  padding: 0 ${themeCssVariables.spacing[1]};
`;

const StyledPillLabel = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

type WidgetDashboardFilterPillsProps = {
  indicators: WidgetDashboardFilterIndicator[];
};

export const WidgetDashboardFilterPills = ({
  indicators,
}: WidgetDashboardFilterPillsProps) => {
  const { t } = useLingui();
  const theme = useTheme();

  const getPillContent = (indicator: WidgetDashboardFilterIndicator) => {
    const { label } = indicator;

    switch (indicator.kind) {
      case 'OVERRIDE': {
        const { fieldLabel } = indicator;

        return {
          Icon: IconFilter,
          text: t`${label} · ${fieldLabel}`,
          tooltip: t`${label} filters this widget on ${fieldLabel}.`,
        };
      }
      case 'UNRESOLVED':
        return {
          Icon: IconFilterOff,
          text: t`Ignores ${label}`,
          tooltip: t`The date field chosen for ${label} on this widget is unavailable. Pick another one in the widget's settings.`,
        };
      case 'IGNORED':
        return {
          Icon: IconFilterOff,
          text: t`Ignores ${label}`,
          tooltip: t`The ${label} filter doesn't apply to this widget.`,
        };
    }
  };

  return indicators.map((indicator) => {
    const { Icon, text, tooltip } = getPillContent(indicator);

    return (
      <Tooltip
        key={indicator.pageLayoutFilterId}
        content={tooltip}
        delay={TooltipDelay.mediumDelay}
      >
        <StyledPill>
          <Icon size={theme.icon.size.sm} />
          <StyledPillLabel>{text}</StyledPillLabel>
        </StyledPill>
      </Tooltip>
    );
  });
};
