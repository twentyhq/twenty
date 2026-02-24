import { isPageLayoutInEditModeComponentState } from '@/page-layout/states/isPageLayoutInEditModeComponentState';
import { WidgetSkeletonLoader } from '@/page-layout/widgets/components/WidgetSkeletonLoader';
import { GraphWidgetChartHasTooManyGroupsEffect } from '@/page-layout/widgets/graph/components/GraphWidgetChartHasTooManyGroupsEffect';
import { useGraphPieChartWidgetData } from '@/page-layout/widgets/graph/graphWidgetPieChart/hooks/useGraphPieChartWidgetData';
import { type PieChartDataItemWithColor } from '@/page-layout/widgets/graph/graphWidgetPieChart/types/PieChartDataItem';
import { assertPieChartWidgetOrThrow } from '@/page-layout/widgets/graph/utils/assertPieChartWidget';
import { buildChartDrilldownQueryParams } from '@/page-layout/widgets/graph/utils/buildChartDrilldownQueryParams';
import { isFilteredViewRedirectionSupported } from '@/page-layout/widgets/graph/utils/isFilteredViewRedirectionSupported';
import { useCurrentWidget } from '@/page-layout/widgets/hooks/useCurrentWidget';
import { useUserFirstDayOfTheWeek } from '@/ui/input/components/internal/date/hooks/useUserFirstDayOfTheWeek';
import { useUserTimezone } from '@/ui/input/components/internal/date/hooks/useUserTimezone';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentValueV2';
import { useFamilySelectorValueV2 } from '@/ui/utilities/state/jotai/hooks/useFamilySelectorValueV2';
import { coreIndexViewIdFromObjectMetadataItemFamilySelector } from '@/views/states/selectors/coreIndexViewIdFromObjectMetadataItemFamilySelector';
import { lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import { getAppPath } from 'twenty-shared/utils';

const GraphWidgetPieChart = lazy(() =>
  import(
    '@/page-layout/widgets/graph/graphWidgetPieChart/components/GraphWidgetPieChart'
  ).then((module) => ({
    default: module.GraphWidgetPieChart,
  })),
);

export const GraphWidgetPieChartRenderer = () => {
  const widget = useCurrentWidget();

  assertPieChartWidgetOrThrow(widget);

  const { userTimezone } = useUserTimezone();

  const {
    data,
    loading,
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

  const isPageLayoutInEditMode = useRecoilComponentValueV2(
    isPageLayoutInEditModeComponentState,
  );
  const indexViewId = useFamilySelectorValueV2(
    coreIndexViewIdFromObjectMetadataItemFamilySelector,
    { objectMetadataItemId: objectMetadataItem.id },
  );

  const { userFirstDayOfTheWeek } = useUserFirstDayOfTheWeek();

  const groupByField = objectMetadataItem.fields.find(
    (field) => field.id === widget.configuration.groupByFieldMetadataId,
  );
  const canRedirectToFilteredView =
    isFilteredViewRedirectionSupported(groupByField);

  const handleSliceClick = (datum: PieChartDataItemWithColor) => {
    const rawValue = formattedToRawLookup.get(datum.id) ?? null;

    const drilldownQueryParams = buildChartDrilldownQueryParams({
      objectMetadataItem,
      configuration: widget.configuration,
      clickedData: {
        primaryBucketRawValue: rawValue,
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

    return navigate(url);
  };

  if (loading) {
    return <WidgetSkeletonLoader />;
  }

  return (
    <Suspense fallback={<WidgetSkeletonLoader />}>
      <GraphWidgetChartHasTooManyGroupsEffect
        hasTooManyGroups={hasTooManyGroups}
      />
      <GraphWidgetPieChart
        data={data}
        id={widget.id}
        objectMetadataItemId={widget.objectMetadataId}
        configuration={widget.configuration}
        showLegend={showLegend}
        colorMode={colorMode}
        displayType="shortNumber"
        onSliceClick={
          isPageLayoutInEditMode || !canRedirectToFilteredView
            ? undefined
            : handleSliceClick
        }
        showDataLabels={showDataLabels}
        showCenterMetric={showCenterMetric}
      />
    </Suspense>
  );
};
