import { useIsPageLayoutInEditMode } from '@/page-layout/hooks/useIsPageLayoutInEditMode';
import { PageLayoutWidgetErrorDisplay } from '@/page-layout/widgets/components/PageLayoutWidgetErrorDisplay';
import { WidgetSkeletonLoader } from '@/page-layout/widgets/components/WidgetSkeletonLoader';
import { GraphWidgetChartBucketMenu } from '@/page-layout/widgets/graph/components/GraphWidgetChartBucketMenu';
import { GraphWidgetChartClickCaptureArea } from '@/page-layout/widgets/graph/components/GraphWidgetChartClickCaptureArea';
import { GraphWidgetChartHasTooManyGroupsEffect } from '@/page-layout/widgets/graph/components/GraphWidgetChartHasTooManyGroupsEffect';
import { useGraphPieChartWidgetData } from '@/page-layout/widgets/graph/graph-widget-pie-chart/hooks/useGraphPieChartWidgetData';
import { type PieChartDataItemWithColor } from '@/page-layout/widgets/graph/graph-widget-pie-chart/types/PieChartDataItem';
import { useGraphWidgetChartBucketMenu } from '@/page-layout/widgets/graph/hooks/useGraphWidgetChartBucketMenu';
import { type RawDimensionValue } from '@/page-layout/widgets/graph/types/RawDimensionValue';
import { assertPieChartWidgetOrThrow } from '@/page-layout/widgets/graph/utils/assertPieChartWidget';
import { buildChartDrilldownQueryParams } from '@/page-layout/widgets/graph/utils/buildChartDrilldownQueryParams';
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

const GraphWidgetPieChart = lazy(() =>
  import('@/page-layout/widgets/graph/graph-widget-pie-chart/components/GraphWidgetPieChart').then(
    (module) => ({
      default: module.GraphWidgetPieChart,
    }),
  ),
);

type GraphWidgetPieChartRendererProps = {
  widget: PageLayoutWidget;
};

export const GraphWidgetPieChartRenderer = ({
  widget,
}: GraphWidgetPieChartRendererProps) => {
  assertPieChartWidgetOrThrow(widget);

  const { userTimezone } = useUserTimezone();

  const {
    data,
    loading,
    error,
    hasTooManyGroups,
    objectMetadataItem,
    showLegend,
    showDataLabels,
    showCenterMetric,
    formattedToRawLookup,
    colorMode,
  } = useGraphPieChartWidgetData({
    objectMetadataItemId: widget.objectMetadataId,
    configuration: widget.configuration,
  });

  const navigate = useNavigate();

  const isPageLayoutInEditMode = useIsPageLayoutInEditMode();
  const indexViewId = useAtomFamilySelectorValue(
    indexViewIdFromObjectMetadataItemFamilySelector,
    { objectMetadataItemId: objectMetadataItem.id },
  );

  const { userFirstDayOfTheWeek } = useUserFirstDayOfTheWeek();

  const chartValueFormatOptions = getChartValueFormatOptions({
    aggregateOperation: widget.configuration.aggregateOperation,
    aggregateFieldMetadataId: widget.configuration.aggregateFieldMetadataId,
    fieldMetadataItems: objectMetadataItem.fields,
    numberFormat: widget.configuration.numberFormat,
  });

  const groupByField = objectMetadataItem.fields.find(
    (field) => field.id === widget.configuration.groupByFieldMetadataId,
  );
  const canRedirectToFilteredView =
    isFilteredViewRedirectionSupported(groupByField);

  const navigateToBucketRecords = (bucketRawValue: RawDimensionValue) => {
    const drilldownQueryParams = buildChartDrilldownQueryParams({
      objectMetadataItem,
      configuration: widget.configuration,
      clickedData: {
        primaryBucketRawValue: bucketRawValue,
      },
      viewId: indexViewId,
      timezone: userTimezone,
      firstDayOfTheWeek: userFirstDayOfTheWeek,
    });

    const url = getAppPath(
      AppPath.RecordIndexPage,
      {
        objectNamePlural: objectMetadataItem.namePlural,
      },
      Object.fromEntries(drilldownQueryParams),
    );

    navigate(url);
  };

  const {
    canCrossFilterChartBuckets,
    handleChartClickCapture,
    tryOpenChartBucketMenu,
  } = useGraphWidgetChartBucketMenu({
    widgetId: widget.id,
    configuration: widget.configuration,
    objectMetadataItem,
  });

  const canClickChartBuckets =
    canRedirectToFilteredView || canCrossFilterChartBuckets;

  const handleSliceClick = (datum: PieChartDataItemWithColor) => {
    const rawValue = formattedToRawLookup.get(datum.key) ?? null;

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
        <GraphWidgetPieChart
          data={data}
          id={widget.id}
          objectMetadataItemId={widget.objectMetadataId}
          configuration={widget.configuration}
          showLegend={showLegend}
          colorMode={colorMode}
          decimals={chartValueFormatOptions.decimals}
          displayType={chartValueFormatOptions.displayType}
          tooltipDisplayType="number"
          onSliceClick={
            isPageLayoutInEditMode || !canClickChartBuckets
              ? undefined
              : handleSliceClick
          }
          showDataLabels={showDataLabels}
          showCenterMetric={showCenterMetric}
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
