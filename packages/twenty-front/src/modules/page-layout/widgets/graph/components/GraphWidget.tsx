import { WidgetSkeletonLoader } from '@/page-layout/widgets/components/WidgetSkeletonLoader';
import { GraphWidgetAggregateChartRenderer } from '@/page-layout/widgets/graph/graphWidgetAggregateChart/components/GraphWidgetAggregateChartRenderer';
import { GraphWidgetBarChartRenderer } from '@/page-layout/widgets/graph/graphWidgetBarChart/components/GraphWidgetBarChartRenderer';
import { GraphWidgetLineChartRenderer } from '@/page-layout/widgets/graph/graphWidgetLineChart/components/GraphWidgetLineChartRenderer';
import { GraphWidgetPieChartRenderer } from '@/page-layout/widgets/graph/graphWidgetPieChart/components/GraphWidgetPieChartRenderer';
import { useCurrentWidget } from '@/page-layout/widgets/hooks/useCurrentWidget';
import { lazy, Suspense } from 'react';
import { WidgetConfigurationType } from '~/generated-metadata/graphql';

const GraphWidgetGaugeChart = lazy(() =>
  import(
    '@/page-layout/widgets/graph/graphWidgetGaugeChart/components/GraphWidgetGaugeChart'
  ).then((module) => ({
    default: module.GraphWidgetGaugeChart,
  })),
);

export const GraphWidget = () => {
  const widget = useCurrentWidget();

  const configurationType = widget.configuration?.configurationType;

  switch (configurationType) {
    case WidgetConfigurationType.AGGREGATE_CHART:
      return <GraphWidgetAggregateChartRenderer />;

    case WidgetConfigurationType.GAUGE_CHART: {
      const gaugeData = {
        value: 0.7,
        min: 0,
        max: 1,
        label: 'Progress',
      };

      return (
        <Suspense fallback={<WidgetSkeletonLoader />}>
          <GraphWidgetGaugeChart
            data={{
              value: gaugeData.value,
              min: gaugeData.min,
              max: gaugeData.max,
              label: gaugeData.label,
            }}
            displayType="percentage"
            showValue
            id={`gauge-chart-${widget.id}`}
          />
        </Suspense>
      );
    }

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
