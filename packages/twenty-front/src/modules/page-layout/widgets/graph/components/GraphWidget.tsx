import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { getDefaultWidgetData } from '@/page-layout/utils/getDefaultWidgetData';
import { PageLayoutWidgetNoDataDisplay } from '@/page-layout/widgets/components/PageLayoutWidgetNoDataDisplay';
import { ChartSkeletonLoader } from '@/page-layout/widgets/graph/components/ChartSkeletonLoader';
import { GraphWidgetNumberChart } from '@/page-layout/widgets/graph/graphWidgetNumberChart/components/GraphWidgetNumberChart';
import { isChartConfigurationReadyForQuery } from '@/page-layout/widgets/graph/utils/isChartConfigurationReadyForQuery';
import { lazy, Suspense } from 'react';
import { GraphType, type PageLayoutWidget } from '~/generated-metadata/graphql';

const GraphWidgetBarChart = lazy(() =>
  import(
    '@/page-layout/widgets/graph/graphWidgetBarChart/components/GraphWidgetBarChart'
  ).then((module) => ({
    default: module.GraphWidgetBarChart,
  })),
);

const GraphWidgetLineChart = lazy(() =>
  import(
    '@/page-layout/widgets/graph/graphWidgetLineChart/components/GraphWidgetLineChart'
  ).then((module) => ({
    default: module.GraphWidgetLineChart,
  })),
);

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

  const { isReady } = isChartConfigurationReadyForQuery(
    widget.configuration,
    objectMetadataItem,
  );

  if (!isReady) {
    return <PageLayoutWidgetNoDataDisplay widgetId={widget.id} />;
  }

  const data: any = getDefaultWidgetData(graphType);

  if (!data) {
    return null;
  }

  switch (graphType) {
    case GraphType.NUMBER:
      return (
        <GraphWidgetNumberChart
          value={data.value}
          trendPercentage={data.trendPercentage}
        />
      );

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

    case GraphType.BAR:
      return (
        <Suspense fallback={<ChartSkeletonLoader />}>
          <GraphWidgetBarChart
            data={data.items}
            indexBy={data.indexBy}
            keys={data.keys}
            seriesLabels={data.seriesLabels}
            layout={data.layout}
            showLegend
            showGrid
            displayType="number"
            id={`bar-chart-${widget.id}`}
          />
        </Suspense>
      );

    case GraphType.LINE:
      return (
        <Suspense fallback={<ChartSkeletonLoader />}>
          <GraphWidgetLineChart
            id={`line-chart-${widget.id}`}
            data={data.series}
            enableArea={data.enableArea}
            showLegend={data.showLegend}
            showGrid={data.showGrid}
            enablePoints={data.enablePoints}
            xAxisLabel={data.xAxisLabel}
            yAxisLabel={data.yAxisLabel}
            displayType={data.displayType}
            prefix={data.prefix}
            suffix={data.suffix}
            xScale={data.xScale}
            yScale={data.yScale}
            curve={data.curve}
            stackedArea={data.stackedArea}
            enableSlices={data.enableSlices}
          />
        </Suspense>
      );

    default:
      return null;
  }
};
