import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { getDefaultWidgetData } from '@/page-layout/utils/getDefaultWidgetData';
import { PageLayoutWidgetNoDataDisplay } from '@/page-layout/widgets/components/PageLayoutWidgetNoDataDisplay';
import { ChartSkeletonLoader } from '@/page-layout/widgets/graph/components/ChartSkeletonLoader';
import { GraphWidgetAggregateChartRenderer } from '@/page-layout/widgets/graph/graphWidgetAggregateChart/components/GraphWidgetAggregateChartRenderer';
import { GraphWidgetBarChartRenderer } from '@/page-layout/widgets/graph/graphWidgetBarChart/components/GraphWidgetBarChartRenderer';
import { GraphWidgetLineChartRenderer } from '@/page-layout/widgets/graph/graphWidgetLineChart/components/GraphWidgetLineChartRenderer';
import { areChartConfigurationFieldsValidForQuery } from '@/page-layout/widgets/graph/utils/areChartConfigurationFieldsValidForQuery';
import { lazy, Suspense } from 'react';
import { GraphType, type PageLayoutWidget } from '~/generated/graphql';

const GraphWidgetPieChart = lazy(() =>
  import(
    '@/page-layout/widgets/graph/graphWidgetPieChart/components/GraphWidgetPieChart'
  ).then((module) => ({
    default: module.GraphWidgetPieChart,
  })),
);

const GraphWidgetGaugeChart = lazy(() =>
  import(
    '@/page-layout/widgets/graph/graphWidgetGaugeChart/components/GraphWidgetGaugeChart'
  ).then((module) => ({
    default: module.GraphWidgetGaugeChart,
  })),
);

export type GraphWidgetProps = {
  widget: PageLayoutWidget;
  objectMetadataId: string;
  graphType: GraphType;
};

export const GraphWidget = ({
  widget,
  objectMetadataId,
  graphType,
}: GraphWidgetProps) => {
  const { objectMetadataItem } = useObjectMetadataItemById({
    objectId: objectMetadataId,
  });

  const hasValidConfiguration = areChartConfigurationFieldsValidForQuery(
    widget.configuration,
    objectMetadataItem,
  );

  if (!hasValidConfiguration) {
    return <PageLayoutWidgetNoDataDisplay widgetId={widget.id} />;
  }

  const data: any = getDefaultWidgetData(graphType);

  if (!data) {
    return null;
  }

  switch (graphType) {
    case GraphType.AGGREGATE:
      return <GraphWidgetAggregateChartRenderer widget={widget} />;

    case GraphType.GAUGE:
      return (
        <Suspense fallback={<ChartSkeletonLoader />}>
          <GraphWidgetGaugeChart
            data={{
              value: data.value,
              min: data.min,
              max: data.max,
              label: data.label,
            }}
            displayType="percentage"
            showValue
            id={`gauge-chart-${widget.id}`}
          />
        </Suspense>
      );

    case GraphType.PIE:
      return (
        <Suspense fallback={<ChartSkeletonLoader />}>
          <GraphWidgetPieChart
            data={data.items}
            showLegend
            displayType="percentage"
            id={`pie-chart-${widget.id}`}
          />
        </Suspense>
      );

    case GraphType.VERTICAL_BAR:
    case GraphType.HORIZONTAL_BAR:
      return <GraphWidgetBarChartRenderer widget={widget} />;

    case GraphType.LINE:
      return <GraphWidgetLineChartRenderer widget={widget} />;

    default:
      return null;
  }
};
