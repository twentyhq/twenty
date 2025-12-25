import { isPageLayoutInEditModeComponentState } from '@/page-layout/states/isPageLayoutInEditModeComponentState';
import { ChartSkeletonLoader } from '@/page-layout/widgets/graph/components/ChartSkeletonLoader';
import { GraphWidgetChartHasTooManyGroupsEffect } from '@/page-layout/widgets/graph/components/GraphWidgetChartHasTooManyGroupsEffect';
import { useGraphPieChartWidgetData } from '@/page-layout/widgets/graph/graphWidgetPieChart/hooks/useGraphPieChartWidgetData';
import { type PieChartDataItem } from '@/page-layout/widgets/graph/graphWidgetPieChart/types/PieChartDataItem';
import { assertPieChartWidgetOrThrow } from '@/page-layout/widgets/graph/utils/assertPieChartWidget';
import { buildChartDrilldownQueryParams } from '@/page-layout/widgets/graph/utils/buildChartDrilldownQueryParams';
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
  } = useGraphPieChartWidgetData({
    objectMetadataItemId: widget.objectMetadataId,
    configuration: widget.configuration,
  });

  const navigate = useNavigate();

  const isPageLayoutInEditMode = useRecoilComponentValue(
    isPageLayoutInEditModeComponentState,
  );
  const indexViewId = useRecoilValue(
    coreIndexViewIdFromObjectMetadataItemFamilySelector({
      objectMetadataItemId: objectMetadataItem.id,
    }),
  );

  const { userFirstDayOfTheWeek } = useUserFirstDayOfTheWeek();

  const handleSliceClick = (datum: PieChartDataItem) => {
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
    return <ChartSkeletonLoader />;
  }

  return (
    <Suspense fallback={<ChartSkeletonLoader />}>
      <GraphWidgetChartHasTooManyGroupsEffect
        hasTooManyGroups={hasTooManyGroups}
      />
      <GraphWidgetPieChart
        data={data}
        id={widget.id}
        objectMetadataItemId={widget.objectMetadataId}
        configuration={widget.configuration}
        showLegend={showLegend}
        displayType="shortNumber"
        onSliceClick={isPageLayoutInEditMode ? undefined : handleSliceClick}
        showDataLabels={showDataLabels}
        showCenterMetric={showCenterMetric}
      />
    </Suspense>
  );
};
