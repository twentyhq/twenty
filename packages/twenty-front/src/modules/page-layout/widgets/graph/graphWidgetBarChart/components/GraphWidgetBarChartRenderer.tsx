import { ChartSkeletonLoader } from '@/page-layout/widgets/graph/components/ChartSkeletonLoader';
import { useGraphBarChartWidgetData } from '@/page-layout/widgets/graph/graphWidgetBarChart/hooks/useGraphBarChartWidgetData';
import { lazy, Suspense } from 'react';
import {
  type BarChartConfiguration,
  type PageLayoutWidget,
} from '~/generated/graphql';

const GraphWidgetBarChart = lazy(() =>
  import(
    '@/page-layout/widgets/graph/graphWidgetBarChart/components/GraphWidgetBarChart'
  ).then((module) => ({
    default: module.GraphWidgetBarChart,
  })),
);

export const GraphWidgetBarChartRenderer = ({
  widget,
}: {
  widget: PageLayoutWidget;
}) => {
  const {
    data,
    indexBy,
    keys,
    series,
    xAxisLabel,
    yAxisLabel,
    showDataLabels,
    layout,
    loading,
  } = useGraphBarChartWidgetData({
    objectMetadataItemId: widget.objectMetadataId,
    configuration: widget.configuration as BarChartConfiguration,
  });

  if (loading) {
    return <ChartSkeletonLoader />;
  }

  const configuration = widget.configuration as BarChartConfiguration;
  const groupMode =
    configuration.groupMode === 'GROUPED' ? 'grouped' : 'stacked';

  return (
    <Suspense fallback={<ChartSkeletonLoader />}>
      <GraphWidgetBarChart
        data={data}
        series={series}
        indexBy={indexBy}
        keys={keys}
        xAxisLabel={xAxisLabel}
        yAxisLabel={yAxisLabel}
        showValues={showDataLabels}
        layout={layout}
        groupMode={groupMode}
        id={widget.id}
        displayType="shortNumber"
      />
    </Suspense>
  );
};
