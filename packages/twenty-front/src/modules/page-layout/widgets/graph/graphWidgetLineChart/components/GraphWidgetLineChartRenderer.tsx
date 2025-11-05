import { ChartSkeletonLoader } from '@/page-layout/widgets/graph/components/ChartSkeletonLoader';
import { GraphWidgetLineChartHasTooManyGroupsEffect } from '@/page-layout/widgets/graph/graphWidgetLineChart/components/GraphWidgetLineChartHasTooManyGroupsEffect';
import { useGraphLineChartWidgetData } from '@/page-layout/widgets/graph/graphWidgetLineChart/hooks/useGraphLineChartWidgetData';
import { lazy, Suspense, useMemo } from 'react';
import {
  type LineChartConfiguration,
  type PageLayoutWidget,
} from '~/generated/graphql';

const GraphWidgetLineChart = lazy(() =>
  import(
    '@/page-layout/widgets/graph/graphWidgetLineChart/components/GraphWidgetLineChart'
  ).then((module) => ({
    default: module.GraphWidgetLineChart,
  })),
);

export const GraphWidgetLineChartRenderer = ({
  widget,
}: {
  widget: PageLayoutWidget;
}) => {
  const {
    series,
    xAxisLabel,
    yAxisLabel,
    showDataLabels,
    hasTooManyGroups,
    loading,
  } = useGraphLineChartWidgetData({
    objectMetadataItemId: widget.objectMetadataId,
    configuration: widget.configuration as LineChartConfiguration,
  });
  console.log('Line chart data:', JSON.stringify(series, null, 2));
  const configuration = widget.configuration as LineChartConfiguration;

  const filterStateKey = useMemo(
    () =>
      `${configuration.rangeMin ?? ''}-${configuration.rangeMax ?? ''}-${configuration.omitNullValues ?? ''}`,
    [
      configuration.rangeMin,
      configuration.rangeMax,
      configuration.omitNullValues,
    ],
  );

  if (loading) {
    return <ChartSkeletonLoader />;
  }

  return (
    <Suspense fallback={<ChartSkeletonLoader />}>
      <GraphWidgetLineChartHasTooManyGroupsEffect
        hasTooManyGroups={hasTooManyGroups}
      />
      <GraphWidgetLineChart
        key={filterStateKey}
        id={widget.id}
        data={series}
        xAxisLabel={xAxisLabel}
        yAxisLabel={yAxisLabel}
        showLegend={true}
        showGrid={true}
        enablePoints={false}
        showValues={showDataLabels}
        displayType="shortNumber"
        enableArea={true}
        curve="monotoneX"
        xScale={{ type: 'point' }}
        yScale={{
          type: 'linear',
          min: configuration.rangeMin ?? 'auto',
          max: configuration.rangeMax ?? 'auto',
        }}
        enableSlices="x"
      />
    </Suspense>
  );
};
