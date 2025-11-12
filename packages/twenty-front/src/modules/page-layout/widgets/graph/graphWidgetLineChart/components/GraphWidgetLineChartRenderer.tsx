import { ChartSkeletonLoader } from '@/page-layout/widgets/graph/components/ChartSkeletonLoader';
import { GraphWidgetChartHasTooManyGroupsEffect } from '@/page-layout/widgets/graph/components/GraphWidgetChartHasTooManyGroupsEffect';
import { useGraphLineChartWidgetData } from '@/page-layout/widgets/graph/graphWidgetLineChart/hooks/useGraphLineChartWidgetData';
import { lazy, Suspense, useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';
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

  const configuration = widget.configuration as LineChartConfiguration;

  const hasGroupByOnSecondaryAxis = isDefined(
    configuration.secondaryAxisGroupByFieldMetadataId,
  );

  const groupMode =
    hasGroupByOnSecondaryAxis && (configuration.isStacked ?? true)
      ? 'stacked'
      : undefined;

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
      <GraphWidgetChartHasTooManyGroupsEffect
        hasTooManyGroups={hasTooManyGroups}
      />
      <GraphWidgetLineChart
        key={filterStateKey}
        id={widget.id}
        data={series}
        xAxisLabel={xAxisLabel}
        yAxisLabel={yAxisLabel}
        enablePointLabel={showDataLabels}
        rangeMin={configuration.rangeMin ?? undefined}
        rangeMax={configuration.rangeMax ?? undefined}
        omitNullValues={configuration.omitNullValues ?? false}
        groupMode={groupMode}
        displayType="shortNumber"
      />
    </Suspense>
  );
};
