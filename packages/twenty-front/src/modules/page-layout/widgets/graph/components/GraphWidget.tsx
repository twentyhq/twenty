import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { PageLayoutWidgetNoDataDisplay } from '@/page-layout/widgets/components/PageLayoutWidgetNoDataDisplay';
import { ChartSkeletonLoader } from '@/page-layout/widgets/graph/components/ChartSkeletonLoader';
import { GraphWidgetAggregateChartRenderer } from '@/page-layout/widgets/graph/graphWidgetAggregateChart/components/GraphWidgetAggregateChartRenderer';
import { GraphWidgetBarChartRenderer } from '@/page-layout/widgets/graph/graphWidgetBarChart/components/GraphWidgetBarChartRenderer';
import { GraphWidgetLineChartRenderer } from '@/page-layout/widgets/graph/graphWidgetLineChart/components/GraphWidgetLineChartRenderer';
import { GraphWidgetPieChartRenderer } from '@/page-layout/widgets/graph/graphWidgetPieChart/components/GraphWidgetPieChartRenderer';
import { areChartConfigurationFieldsValidForQuery } from '@/page-layout/widgets/graph/utils/areChartConfigurationFieldsValidForQuery';
import { useCurrentWidget } from '@/page-layout/widgets/hooks/useCurrentWidget';
import { lazy, Suspense } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { WidgetConfigurationType } from '~/generated/graphql';

const GraphWidgetGaugeChart = lazy(() =>
  import(
    '@/page-layout/widgets/graph/graphWidgetGaugeChart/components/GraphWidgetGaugeChart'
  ).then((module) => ({
    default: module.GraphWidgetGaugeChart,
  })),
);

export type GraphWidgetProps = {
  objectMetadataId: string;
};

export const GraphWidget = ({ objectMetadataId }: GraphWidgetProps) => {
  const widget = useCurrentWidget();

  const { objectMetadataItem } = useObjectMetadataItemById({
    objectId: objectMetadataId,
  });

  const hasValidConfiguration = areChartConfigurationFieldsValidForQuery(
    widget.configuration,
    objectMetadataItem,
  );

  if (!isDefined(widget.configuration) || !hasValidConfiguration) {
    return <PageLayoutWidgetNoDataDisplay />;
  }

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
        <Suspense fallback={<ChartSkeletonLoader />}>
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
