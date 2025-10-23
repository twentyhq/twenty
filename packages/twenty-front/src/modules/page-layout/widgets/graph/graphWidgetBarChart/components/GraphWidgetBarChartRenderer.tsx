import { ChartSkeletonLoader } from '@/page-layout/widgets/graph/components/ChartSkeletonLoader';
import { GraphWidgetBarChartHasTooManyGroupsEffect } from '@/page-layout/widgets/graph/graphWidgetBarChart/components/GraphWidgetBarChartHasTooManyGroupsEffect';
import { useGraphBarChartWidgetData } from '@/page-layout/widgets/graph/graphWidgetBarChart/hooks/useGraphBarChartWidgetData';
import { lazy, Suspense, useMemo } from 'react';
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
    hasTooManyGroups,
  } = useGraphBarChartWidgetData({
    objectMetadataItemId: widget.objectMetadataId,
    configuration: widget.configuration as BarChartConfiguration,
  });

  const configuration = widget.configuration as BarChartConfiguration;
  const groupMode =
    configuration.groupMode === 'GROUPED' ? 'grouped' : 'stacked';

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
    <>
      <GraphWidgetBarChartHasTooManyGroupsEffect
        hasTooManyGroups={hasTooManyGroups}
      />
      <Suspense fallback={<ChartSkeletonLoader />}>
        <GraphWidgetBarChart
          key={filterStateKey}
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
          rangeMin={configuration.rangeMin ?? undefined}
          rangeMax={configuration.rangeMax ?? undefined}
        />
      </Suspense>
    </>
  );
};
