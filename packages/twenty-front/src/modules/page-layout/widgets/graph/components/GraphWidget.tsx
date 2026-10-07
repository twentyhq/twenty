import { DashboardFilterRequiredSlotStatusDisplay } from '@/page-layout/dashboard-filters/components/DashboardFilterRequiredSlotStatusDisplay';
import { useAreDashboardFilterValuesInitialized } from '@/page-layout/dashboard-filters/hooks/useAreDashboardFilterValuesInitialized';
import { useMissingRequiredDashboardFilterSlot } from '@/page-layout/dashboard-filters/hooks/useMissingRequiredDashboardFilterSlot';
import { WidgetSkeletonLoader } from '@/page-layout/widgets/components/WidgetSkeletonLoader';
import { GraphWidgetAggregateChartRenderer } from '@/page-layout/widgets/graph/graph-widget-aggregate-chart/components/GraphWidgetAggregateChartRenderer';
import { GraphWidgetBarChartRenderer } from '@/page-layout/widgets/graph/graph-widget-bar-chart/components/GraphWidgetBarChartRenderer';
import { GraphWidgetLineChartRenderer } from '@/page-layout/widgets/graph/graph-widget-line-chart/components/GraphWidgetLineChartRenderer';
import { GraphWidgetPieChartRenderer } from '@/page-layout/widgets/graph/graph-widget-pie-chart/components/GraphWidgetPieChartRenderer';
import { useCurrentWidget } from '@/page-layout/widgets/hooks/useCurrentWidget';
import { isDefined } from 'twenty-shared/utils';
import { WidgetConfigurationType } from '~/generated-metadata/graphql';

export const GraphWidget = () => {
  const widget = useCurrentWidget();

  const areDashboardFilterValuesInitialized =
    useAreDashboardFilterValuesInitialized();

  const missingRequiredDashboardFilterSlot =
    useMissingRequiredDashboardFilterSlot();

  // Both decided before picking a renderer so none of their query hooks mounts, and never with values the initializer is about to replace.
  if (!areDashboardFilterValuesInitialized) {
    return <WidgetSkeletonLoader />;
  }

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
