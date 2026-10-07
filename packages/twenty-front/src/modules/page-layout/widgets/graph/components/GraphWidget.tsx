import { useMissingRequiredDashboardFilterSlot } from '@/page-layout/dashboard-filters/hooks/useMissingRequiredDashboardFilterSlot';
import { useWidgetConfigurationWithDashboardFilters } from '@/page-layout/dashboard-filters/hooks/useWidgetConfigurationWithDashboardFilters';
import { PageLayoutWidgetStatusDisplay } from '@/page-layout/widgets/components/PageLayoutWidgetStatusDisplay';
import { GraphWidgetAggregateChartRenderer } from '@/page-layout/widgets/graph/graph-widget-aggregate-chart/components/GraphWidgetAggregateChartRenderer';
import { GraphWidgetBarChartRenderer } from '@/page-layout/widgets/graph/graph-widget-bar-chart/components/GraphWidgetBarChartRenderer';
import { GraphWidgetLineChartRenderer } from '@/page-layout/widgets/graph/graph-widget-line-chart/components/GraphWidgetLineChartRenderer';
import { GraphWidgetPieChartRenderer } from '@/page-layout/widgets/graph/graph-widget-pie-chart/components/GraphWidgetPieChartRenderer';
import { useCurrentWidget } from '@/page-layout/widgets/hooks/useCurrentWidget';
import { useLingui } from '@lingui/react/macro';
import { useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { WidgetConfigurationType } from '~/generated-metadata/graphql';

export const GraphWidget = () => {
  const { t } = useLingui();
  const widget = useCurrentWidget();

  // Renderers take the widget as a prop so one merge covers every chart type without changing useCurrentWidget consumers repo-wide.
  const configurationWithDashboardFilters =
    useWidgetConfigurationWithDashboardFilters(widget);

  const missingRequiredDashboardFilterSlot =
    useMissingRequiredDashboardFilterSlot(widget);

  const widgetWithDashboardFilters = useMemo(
    () =>
      configurationWithDashboardFilters === widget.configuration
        ? widget
        : { ...widget, configuration: configurationWithDashboardFilters },
    [widget, configurationWithDashboardFilters],
  );

  // The renderers own the chart data hooks, so not mounting them is what keeps the query from firing.
  if (isDefined(missingRequiredDashboardFilterSlot)) {
    const slotLabel = missingRequiredDashboardFilterSlot.label;

    return (
      <PageLayoutWidgetStatusDisplay
        tooltipId={`widget-required-dashboard-filter-tooltip-${widget.id}`}
        text={t`Set the ${slotLabel} filter to see this chart`}
        tooltipContent={t`${slotLabel} is a required dashboard filter. Pick a value in the filter bar to load this chart.`}
        color="gray"
      />
    );
  }

  const configurationType =
    widgetWithDashboardFilters.configuration?.configurationType;

  switch (configurationType) {
    case WidgetConfigurationType.AGGREGATE_CHART:
      return (
        <GraphWidgetAggregateChartRenderer
          widget={widgetWithDashboardFilters}
        />
      );

    case WidgetConfigurationType.PIE_CHART:
      return (
        <GraphWidgetPieChartRenderer widget={widgetWithDashboardFilters} />
      );

    case WidgetConfigurationType.BAR_CHART:
      return (
        <GraphWidgetBarChartRenderer widget={widgetWithDashboardFilters} />
      );

    case WidgetConfigurationType.LINE_CHART:
      return (
        <GraphWidgetLineChartRenderer widget={widgetWithDashboardFilters} />
      );

    default:
      return null;
  }
};
