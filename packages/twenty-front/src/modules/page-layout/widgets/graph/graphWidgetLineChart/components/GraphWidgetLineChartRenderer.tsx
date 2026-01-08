import { isPageLayoutInEditModeComponentState } from '@/page-layout/states/isPageLayoutInEditModeComponentState';
import { ChartSkeletonLoader } from '@/page-layout/widgets/graph/components/ChartSkeletonLoader';
import { GraphWidgetChartHasTooManyGroupsEffect } from '@/page-layout/widgets/graph/components/GraphWidgetChartHasTooManyGroupsEffect';
import { LINE_CHART_CONSTANTS } from '@/page-layout/widgets/graph/graphWidgetLineChart/constants/LineChartConstants';
import { useGraphLineChartWidgetData } from '@/page-layout/widgets/graph/graphWidgetLineChart/hooks/useGraphLineChartWidgetData';
import { type LineChartDataPoint } from '@/page-layout/widgets/graph/graphWidgetLineChart/types/LineChartDataPoint';
import { assertLineChartWidgetOrThrow } from '@/page-layout/widgets/graph/utils/assertLineChartWidget';
import { buildChartDrilldownQueryParams } from '@/page-layout/widgets/graph/utils/buildChartDrilldownQueryParams';
import { generateChartAggregateFilterKey } from '@/page-layout/widgets/graph/utils/generateChartAggregateFilterKey';
import { useCurrentWidget } from '@/page-layout/widgets/hooks/useCurrentWidget';
import { useUserFirstDayOfTheWeek } from '@/ui/input/components/internal/date/hooks/useUserFirstDayOfTheWeek';
import { useUserTimezone } from '@/ui/input/components/internal/date/hooks/useUserTimezone';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { coreIndexViewIdFromObjectMetadataItemFamilySelector } from '@/views/states/selectors/coreIndexViewIdFromObjectMetadataItemFamilySelector';
import { type LineSeries, type Point } from '@nivo/line';
import { lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { AppPath } from 'twenty-shared/types';
import { getAppPath, isDefined } from 'twenty-shared/utils';

const GraphWidgetLineChart = lazy(() =>
  import(
    '@/page-layout/widgets/graph/graphWidgetLineChart/components/GraphWidgetLineChart'
  ).then((module) => ({
    default: module.GraphWidgetLineChart,
  })),
);

export const GraphWidgetLineChartRenderer = () => {
  const widget = useCurrentWidget();

  assertLineChartWidgetOrThrow(widget);

  const { userTimezone } = useUserTimezone();

  const {
    series,
    xAxisLabel,
    yAxisLabel,
    showDataLabels,
    showLegend,
    hasTooManyGroups,
    loading,
    formattedToRawLookup,
    objectMetadataItem,
  } = useGraphLineChartWidgetData({
    objectMetadataItemId: widget.objectMetadataId,
    configuration: widget.configuration,
  });

  const navigate = useNavigate();
  const configuration = widget.configuration;
  const isPageLayoutInEditMode = useRecoilComponentValue(
    isPageLayoutInEditModeComponentState,
  );

  const hasGroupByOnSecondaryAxis = isDefined(
    configuration.secondaryAxisGroupByFieldMetadataId,
  );

  const groupMode =
    hasGroupByOnSecondaryAxis &&
    (configuration.isStacked ?? LINE_CHART_CONSTANTS.IS_STACKED_DEFAULT)
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

  const { userFirstDayOfTheWeek } = useUserFirstDayOfTheWeek();

  const handlePointClick = (point: Point<LineSeries>) => {
    const xValue = (point.data as LineChartDataPoint).x;
    const rawValue = formattedToRawLookup.get(xValue as string) ?? null;

    const queryParams = buildChartDrilldownQueryParams({
      objectMetadataItem,
      configuration,
      clickedData: {
        primaryBucketRawValue: rawValue,
      },
      viewId: indexViewId,
      timezone: userTimezone,
      firstDayOfTheWeek: userFirstDayOfTheWeek,
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
        showLegend={showLegend}
        rangeMin={configuration.rangeMin ?? undefined}
        rangeMax={configuration.rangeMax ?? undefined}
        omitNullValues={configuration.omitNullValues ?? false}
        groupMode={groupMode}
        displayType="shortNumber"
        onSliceClick={isPageLayoutInEditMode ? undefined : handlePointClick}
      />
    </Suspense>
  );
};
