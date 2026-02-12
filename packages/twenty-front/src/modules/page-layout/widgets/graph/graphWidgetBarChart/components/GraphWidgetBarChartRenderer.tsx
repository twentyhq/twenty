import { isPageLayoutInEditModeComponentState } from '@/page-layout/states/isPageLayoutInEditModeComponentState';
import { WidgetSkeletonLoader } from '@/page-layout/widgets/components/WidgetSkeletonLoader';
import { GraphWidgetChartHasTooManyGroupsEffect } from '@/page-layout/widgets/graph/components/GraphWidgetChartHasTooManyGroupsEffect';
import { useGraphBarChartWidgetData } from '@/page-layout/widgets/graph/graphWidgetBarChart/hooks/useGraphBarChartWidgetData';
import { type BarChartSlice } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartSlice';
import { assertBarChartWidgetOrThrow } from '@/page-layout/widgets/graph/utils/assertBarChartWidget';
import { buildChartDrilldownQueryParams } from '@/page-layout/widgets/graph/utils/buildChartDrilldownQueryParams';
import { generateChartAggregateFilterKey } from '@/page-layout/widgets/graph/utils/generateChartAggregateFilterKey';
import { isFilteredViewRedirectionSupported } from '@/page-layout/widgets/graph/utils/isFilteredViewRedirectionSupported';
import { useCurrentWidget } from '@/page-layout/widgets/hooks/useCurrentWidget';
import { useUserFirstDayOfTheWeek } from '@/ui/input/components/internal/date/hooks/useUserFirstDayOfTheWeek';
import { useUserTimezone } from '@/ui/input/components/internal/date/hooks/useUserTimezone';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { coreIndexViewIdFromObjectMetadataItemFamilySelector } from '@/views/states/selectors/coreIndexViewIdFromObjectMetadataItemFamilySelector';
import { lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { AppPath } from 'twenty-shared/types';
import { getAppPath } from 'twenty-shared/utils';
import { AxisNameDisplay } from '~/generated-metadata/graphql';

const GraphWidgetBarChart = lazy(() =>
  import(
    '@/page-layout/widgets/graph/graphWidgetBarChart/components/GraphWidgetBarChart'
  ).then((module) => ({
    default: module.GraphWidgetBarChart,
  })),
);

export const GraphWidgetBarChartRenderer = () => {
  const widget = useCurrentWidget();

  assertBarChartWidgetOrThrow(widget);

  const { userTimezone } = useUserTimezone();
  const { userFirstDayOfTheWeek } = useUserFirstDayOfTheWeek();

  const {
    data,
    indexBy,
    keys,
    series,
    xAxisLabel,
    yAxisLabel,
    showDataLabels,
    showLegend,
    layout,
    groupMode,
    loading,
    hasTooManyGroups,
    formattedToRawLookup,
    colorMode,
    objectMetadataItem,
  } = useGraphBarChartWidgetData({
    objectMetadataItemId: widget.objectMetadataId,
    configuration: widget.configuration,
  });

  const navigate = useNavigate();
  const configuration = widget.configuration;
  const isPageLayoutInEditMode = useRecoilComponentValue(
    isPageLayoutInEditModeComponentState,
  );

  const axisNameDisplay = configuration.axisNameDisplay;

  const showXLabel =
    axisNameDisplay === AxisNameDisplay.X ||
    axisNameDisplay === AxisNameDisplay.BOTH;

  const showYLabel =
    axisNameDisplay === AxisNameDisplay.Y ||
    axisNameDisplay === AxisNameDisplay.BOTH;

  const xAxisLabelToDisplay = showXLabel ? xAxisLabel : undefined;
  const yAxisLabelToDisplay = showYLabel ? yAxisLabel : undefined;

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

  const primaryGroupByField = objectMetadataItem.fields.find(
    (field) => field.id === configuration.primaryAxisGroupByFieldMetadataId,
  );
  const canRedirectToFilteredView =
    isFilteredViewRedirectionSupported(primaryGroupByField);

  const handleSliceClick = (slice: BarChartSlice) => {
    const displayValue = slice.indexValue;
    const rawValue = formattedToRawLookup.get(displayValue) ?? null;

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
    return <WidgetSkeletonLoader />;
  }

  return (
    <Suspense fallback={<WidgetSkeletonLoader />}>
      <GraphWidgetChartHasTooManyGroupsEffect
        hasTooManyGroups={hasTooManyGroups}
      />
      <GraphWidgetBarChart
        key={chartFilterKey}
        data={data}
        series={series}
        indexBy={indexBy}
        keys={keys}
        xAxisLabel={xAxisLabelToDisplay}
        yAxisLabel={yAxisLabelToDisplay}
        showValues={showDataLabels}
        showLegend={showLegend}
        layout={layout}
        groupMode={groupMode}
        colorMode={colorMode}
        id={widget.id}
        displayType="shortNumber"
        rangeMin={configuration.rangeMin ?? undefined}
        rangeMax={configuration.rangeMax ?? undefined}
        omitNullValues={configuration.omitNullValues ?? false}
        onSliceClick={
          isPageLayoutInEditMode || !canRedirectToFilteredView
            ? undefined
            : handleSliceClick
        }
      />
    </Suspense>
  );
};
