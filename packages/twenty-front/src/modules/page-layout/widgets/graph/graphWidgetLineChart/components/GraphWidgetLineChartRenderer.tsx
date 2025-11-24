import { ChartSkeletonLoader } from '@/page-layout/widgets/graph/components/ChartSkeletonLoader';
import { GraphWidgetChartHasTooManyGroupsEffect } from '@/page-layout/widgets/graph/components/GraphWidgetChartHasTooManyGroupsEffect';
import { LINE_CHART_IS_STACKED_DEFAULT } from '@/page-layout/widgets/graph/graphWidgetLineChart/constants/LineChartIsStackedDefault';
import { useGraphLineChartWidgetData } from '@/page-layout/widgets/graph/graphWidgetLineChart/hooks/useGraphLineChartWidgetData';
import { type LineChartDataPoint } from '@/page-layout/widgets/graph/graphWidgetLineChart/types/LineChartDataPoint';
import { buildChartDrilldownQueryParams } from '@/page-layout/widgets/graph/utils/buildChartDrilldownQueryParams';
import { generateChartAggregateFilterKey } from '@/page-layout/widgets/graph/utils/generateChartAggregateFilterKey';
import { coreIndexViewIdFromObjectMetadataItemFamilySelector } from '@/views/states/selectors/coreIndexViewIdFromObjectMetadataItemFamilySelector';
import { type LineSeries, type Point } from '@nivo/line';
import { lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { AppPath } from 'twenty-shared/types';
import { getAppPath, isDefined } from 'twenty-shared/utils';
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
    dimensionMetadata,
    objectMetadataItem,
  } = useGraphLineChartWidgetData({
    objectMetadataItemId: widget.objectMetadataId,
    configuration: widget.configuration as LineChartConfiguration,
  });

  const navigate = useNavigate();
  const configuration = widget.configuration as LineChartConfiguration;

  const hasGroupByOnSecondaryAxis = isDefined(
    configuration.secondaryAxisGroupByFieldMetadataId,
  );

  const groupMode =
    hasGroupByOnSecondaryAxis &&
    (configuration.isStacked ?? LINE_CHART_IS_STACKED_DEFAULT)
      ? 'stacked'
      : undefined;

  const chartFilterKey = generateChartAggregateFilterKey(
    configuration.rangeMin,
    configuration.rangeMax,
    configuration.omitNullValues,
  );

  const indexViewId = useRecoilValue(
    coreIndexViewIdFromObjectMetadataItemFamilySelector({
      objectMetadataItemId: objectMetadataItem.id,
    }),
  );

  const handlePointClick = (point: Point<LineSeries>) => {
    const xValue = (point.data as LineChartDataPoint).x;
    const rawValue = dimensionMetadata.get(xValue as string) ?? null;

    const queryParams = buildChartDrilldownQueryParams({
      objectMetadataItem,
      configuration,
      clickedData: {
        primaryBucketRawValue: rawValue,
      },
      viewId: indexViewId,
      timezone: configuration.timezone ?? undefined,
    });

    const url = getAppPath(
      AppPath.RecordIndexPage,
      { objectNamePlural: objectMetadataItem.namePlural },
      Object.fromEntries(queryParams),
    );

    navigate(url);
  };

  if (loading) {
    return <ChartSkeletonLoader />;
  }

  return (
    <Suspense fallback={<ChartSkeletonLoader />}>
      <GraphWidgetChartHasTooManyGroupsEffect
        hasTooManyGroups={hasTooManyGroups}
      />
      <GraphWidgetLineChart
        key={chartFilterKey}
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
        onSliceClick={handlePointClick}
      />
    </Suspense>
  );
};
