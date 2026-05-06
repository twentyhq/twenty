import { PageLayoutWidgetInvalidConfigDisplay } from '@/page-layout/widgets/components/PageLayoutWidgetInvalidConfigDisplay';
import { GraphWidgetAggregateChartRenderer } from '@/page-layout/widgets/graph/graph-widget-aggregate-chart/components/GraphWidgetAggregateChartRenderer';
import { GraphWidgetBarChartRenderer } from '@/page-layout/widgets/graph/graph-widget-bar-chart/components/GraphWidgetBarChartRenderer';
import { GraphWidgetLineChartRenderer } from '@/page-layout/widgets/graph/graph-widget-line-chart/components/GraphWidgetLineChartRenderer';
import { GraphWidgetPieChartRenderer } from '@/page-layout/widgets/graph/graph-widget-pie-chart/components/GraphWidgetPieChartRenderer';
import { useCurrentWidget } from '@/page-layout/widgets/hooks/useCurrentWidget';
import { WidgetConfigurationType } from '~/generated-metadata/graphql';

export const GraphWidget = () => {
  const widget = useCurrentWidget();

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

    case WidgetConfigurationType.GAUGE_CHART:
      return <PageLayoutWidgetInvalidConfigDisplay />;

    default:
      return null;
  }
};
