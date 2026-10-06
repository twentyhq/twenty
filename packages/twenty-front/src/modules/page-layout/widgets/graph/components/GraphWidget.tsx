import { DashboardFilterRequiredSlotStatusDisplay } from '@/page-layout/dashboard-filters/components/DashboardFilterRequiredSlotStatusDisplay';
import { useMissingRequiredDashboardFilterSlot } from '@/page-layout/dashboard-filters/hooks/useMissingRequiredDashboardFilterSlot';
import { GraphWidgetAggregateChartRenderer } from '@/page-layout/widgets/graph/graph-widget-aggregate-chart/components/GraphWidgetAggregateChartRenderer';
import { GraphWidgetBarChartRenderer } from '@/page-layout/widgets/graph/graph-widget-bar-chart/components/GraphWidgetBarChartRenderer';
import { GraphWidgetLineChartRenderer } from '@/page-layout/widgets/graph/graph-widget-line-chart/components/GraphWidgetLineChartRenderer';
import { GraphWidgetPieChartRenderer } from '@/page-layout/widgets/graph/graph-widget-pie-chart/components/GraphWidgetPieChartRenderer';
import { useCurrentWidget } from '@/page-layout/widgets/hooks/useCurrentWidget';
import { isDefined } from 'twenty-shared/utils';
import { WidgetConfigurationType } from '~/generated-metadata/graphql';

export const GraphWidget = () => {
  const widget = useCurrentWidget();

  const missingRequiredDashboardFilterSlot =
    useMissingRequiredDashboardFilterSlot();

  // Decided before picking a renderer so none of their query hooks mounts.
  if (isDefined(missingRequiredDashboardFilterSlot)) {
    return (
      <DashboardFilterRequiredSlotStatusDisplay
        widgetId={widget.id}
        slot={missingRequiredDashboardFilterSlot}
      />
    );
  }

  const configurationType = widget.configuration?.configurationType;

  switch (configurationType) {
    case WidgetConfigurationType.AGGREGATE_CHART:
      return <GraphWidgetAggregateChartRenderer />;

    case WidgetConfigurationType.PIE_CHART:
      return <GraphWidgetPieChartRenderer />;

    case WidgetConfigurationType.BAR_CHART:
      return <GraphWidgetBarChartRenderer />;

    case WidgetConfigurationType.LINE_CHART:
      return <GraphWidgetLineChartRenderer />;

    default:
      return null;
  }
};
