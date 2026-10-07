import { useWidgetConfigurationWithDashboardFilters } from '@/page-layout/dashboard-filters/hooks/useWidgetConfigurationWithDashboardFilters';
import { GraphWidgetAggregateChartRenderer } from '@/page-layout/widgets/graph/graph-widget-aggregate-chart/components/GraphWidgetAggregateChartRenderer';
import { GraphWidgetBarChartRenderer } from '@/page-layout/widgets/graph/graph-widget-bar-chart/components/GraphWidgetBarChartRenderer';
import { GraphWidgetLineChartRenderer } from '@/page-layout/widgets/graph/graph-widget-line-chart/components/GraphWidgetLineChartRenderer';
import { GraphWidgetPieChartRenderer } from '@/page-layout/widgets/graph/graph-widget-pie-chart/components/GraphWidgetPieChartRenderer';
import { useCurrentWidget } from '@/page-layout/widgets/hooks/useCurrentWidget';
import { useMemo } from 'react';
import { WidgetConfigurationType } from '~/generated-metadata/graphql';

export const GraphWidget = () => {
  const widget = useCurrentWidget();

  // Renderers take the widget as a prop so one merge covers every chart type without changing useCurrentWidget consumers repo-wide.
  const configurationWithDashboardFilters =
    useWidgetConfigurationWithDashboardFilters(widget);

  const widgetWithDashboardFilters = useMemo(
    () =>
      configurationWithDashboardFilters === widget.configuration
        ? widget
        : { ...widget, configuration: configurationWithDashboardFilters },
    [widget, configurationWithDashboardFilters],
  );

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
