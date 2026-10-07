import { useIsPageLayoutInEditMode } from '@/page-layout/hooks/useIsPageLayoutInEditMode';
import { PageLayoutWidgetErrorDisplay } from '@/page-layout/widgets/components/PageLayoutWidgetErrorDisplay';
import { WidgetSkeletonLoader } from '@/page-layout/widgets/components/WidgetSkeletonLoader';
import { GraphWidgetChartBucketMenu } from '@/page-layout/widgets/graph/components/GraphWidgetChartBucketMenu';
import { GraphWidgetChartClickCaptureArea } from '@/page-layout/widgets/graph/components/GraphWidgetChartClickCaptureArea';
import { GraphWidgetChartHasTooManyGroupsEffect } from '@/page-layout/widgets/graph/components/GraphWidgetChartHasTooManyGroupsEffect';
import { useGraphBarChartWidgetData } from '@/page-layout/widgets/graph/graph-widget-bar-chart/hooks/useGraphBarChartWidgetData';
import { type BarChartSlice } from '@/page-layout/widgets/graph/graph-widget-bar-chart/types/BarChartSlice';
import { useGraphWidgetChartBucketMenu } from '@/page-layout/widgets/graph/hooks/useGraphWidgetChartBucketMenu';
import { type RawDimensionValue } from '@/page-layout/widgets/graph/types/RawDimensionValue';
import { assertBarChartWidgetOrThrow } from '@/page-layout/widgets/graph/utils/assertBarChartWidget';
import { buildChartDrilldownQueryParams } from '@/page-layout/widgets/graph/utils/buildChartDrilldownQueryParams';
import { generateChartAggregateFilterKey } from '@/page-layout/widgets/graph/utils/generateChartAggregateFilterKey';
import { getChartValueFormatOptions } from '@/page-layout/widgets/graph/utils/getChartValueFormatOptions';
import { isFilteredViewRedirectionSupported } from '@/page-layout/widgets/graph/utils/isFilteredViewRedirectionSupported';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { useUserFirstDayOfTheWeek } from '@/ui/input/components/internal/date/hooks/useUserFirstDayOfTheWeek';
import { useUserTimezone } from '@/ui/input/components/internal/date/hooks/useUserTimezone';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { indexViewIdFromObjectMetadataItemFamilySelector } from '@/views/states/selectors/indexViewIdFromObjectMetadataItemFamilySelector';
import { lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import { getAppPath, isDefined } from 'twenty-shared/utils';
import { AxisNameDisplay } from '~/generated-metadata/graphql';

const GraphWidgetBarChart = lazy(() =>
  import('@/page-layout/widgets/graph/graph-widget-bar-chart/components/GraphWidgetBarChart').then(
    (module) => ({
      default: module.GraphWidgetBarChart,
    }),
  ),
);

type GraphWidgetBarChartRendererProps = {
  widget: PageLayoutWidget;
};

export const GraphWidgetBarChartRenderer = ({
  widget,
}: GraphWidgetBarChartRendererProps) => {
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
    error,
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
  const isPageLayoutInEditMode = useIsPageLayoutInEditMode();

  const chartValueFormatOptions = getChartValueFormatOptions({
    aggregateOperation: configuration.aggregateOperation,
    aggregateFieldMetadataId: configuration.aggregateFieldMetadataId,
    fieldMetadataItems: objectMetadataItem.fields,
    numberFormat: configuration.numberFormat,
  });

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

  const indexViewId = useAtomFamilySelectorValue(
    indexViewIdFromObjectMetadataItemFamilySelector,
    { objectMetadataItemId: objectMetadataItem.id },
  );

  const primaryGroupByField = objectMetadataItem.fields.find(
    (field: { id: string }) =>
      field.id === configuration.primaryAxisGroupByFieldMetadataId,
  );
  const canRedirectToFilteredView =
    isFilteredViewRedirectionSupported(primaryGroupByField);

  const navigateToBucketRecords = (bucketRawValue: RawDimensionValue) => {
    const queryParams = buildChartDrilldownQueryParams({
      objectMetadataItem,
      configuration,
      clickedData: {
        primaryBucketRawValue: bucketRawValue,
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

  const {
    canCrossFilterChartBuckets,
    handleChartClickCapture,
    tryOpenChartBucketMenu,
  } = useGraphWidgetChartBucketMenu({
    widgetId: widget.id,
    configuration,
    objectMetadataItem,
  });

  const canClickChartBuckets =
    canRedirectToFilteredView || canCrossFilterChartBuckets;

  const handleSliceClick = (slice: BarChartSlice) => {
    const displayValue = slice.indexValue;
    const rawValue = formattedToRawLookup.get(displayValue) ?? null;

    if (tryOpenChartBucketMenu(rawValue) || !canRedirectToFilteredView) {
      return;
    }

    navigateToBucketRecords(rawValue);
  };

  if (loading) {
    return <WidgetSkeletonLoader />;
  }

  if (isDefined(error)) {
    return <PageLayoutWidgetErrorDisplay widgetId={widget.id} error={error} />;
  }

  return (
    <Suspense fallback={<WidgetSkeletonLoader />}>
      <GraphWidgetChartHasTooManyGroupsEffect
        hasTooManyGroups={hasTooManyGroups}
      />
      <GraphWidgetChartClickCaptureArea
        onClickCapture={handleChartClickCapture}
      >
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
          decimals={chartValueFormatOptions.decimals}
          displayType={chartValueFormatOptions.displayType}
          axisDisplayType="shortNumber"
          tooltipDisplayType="number"
          rangeMin={configuration.rangeMin ?? undefined}
          rangeMax={configuration.rangeMax ?? undefined}
          omitNullValues={configuration.omitNullValues ?? false}
          onSliceClick={
            isPageLayoutInEditMode || !canClickChartBuckets
              ? undefined
              : handleSliceClick
          }
        />
      </GraphWidgetChartClickCaptureArea>
      <GraphWidgetChartBucketMenu
        widgetId={widget.id}
        onOpenRecords={
          canRedirectToFilteredView ? navigateToBucketRecords : undefined
        }
      />
    </Suspense>
  );
};
