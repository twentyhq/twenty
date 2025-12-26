import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { getDefaultWidgetData } from '@/page-layout/utils/getDefaultWidgetData';
import { PageLayoutWidgetNoDataDisplay } from '@/page-layout/widgets/components/PageLayoutWidgetNoDataDisplay';
import { ChartSkeletonLoader } from '@/page-layout/widgets/graph/components/ChartSkeletonLoader';
import { GraphWidgetAggregateChartRenderer } from '@/page-layout/widgets/graph/graphWidgetAggregateChart/components/GraphWidgetAggregateChartRenderer';
import { GraphWidgetBarChartRenderer } from '@/page-layout/widgets/graph/graphWidgetBarChart/components/GraphWidgetBarChartRenderer';
import { GraphWidgetLineChartRenderer } from '@/page-layout/widgets/graph/graphWidgetLineChart/components/GraphWidgetLineChartRenderer';
import { GraphWidgetPieChartRenderer } from '@/page-layout/widgets/graph/graphWidgetPieChart/components/GraphWidgetPieChartRenderer';
import { areChartConfigurationFieldsValidForQuery } from '@/page-layout/widgets/graph/utils/areChartConfigurationFieldsValidForQuery';
import { lazy, Suspense } from 'react';
import { GraphType } from '~/generated/graphql';
import { useCurrentWidget } from '@/page-layout/widgets/hooks/useCurrentWidget';

const GraphWidgetGaugeChart = lazy(() =>
  import(
    '@/page-layout/widgets/graph/graphWidgetGaugeChart/components/GraphWidgetGaugeChart'
  ).then((module) => ({
    default: module.GraphWidgetGaugeChart,
  })),
);

export type GraphWidgetProps = {
  objectMetadataId: string;
  graphType: GraphType;
};

export const GraphWidget = ({
  objectMetadataId,
  graphType,
}: GraphWidgetProps) => {
  const widget = useCurrentWidget();

  const { objectMetadataItem } = useObjectMetadataItemById({
    objectId: objectMetadataId,
  });

  const hasValidConfiguration = areChartConfigurationFieldsValidForQuery(
    widget.configuration,
    objectMetadataItem,
  );

  if (!hasValidConfiguration) {
    return <PageLayoutWidgetNoDataDisplay />;
  }

  switch (graphType) {
    case GraphType.AGGREGATE:
      return <GraphWidgetAggregateChartRenderer />;

    case GraphType.GAUGE: {
      const gaugeData: any = getDefaultWidgetData(graphType);
      if (!gaugeData) {
        return null;
      }
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

    case GraphType.PIE:
      return <GraphWidgetPieChartRenderer />;

    case GraphType.VERTICAL_BAR:
    case GraphType.HORIZONTAL_BAR:
      return <GraphWidgetBarChartRenderer />;

    case GraphType.LINE:
      return <GraphWidgetLineChartRenderer />;

    default:
      return null;
  }
};
