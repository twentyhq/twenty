import { ChartSkeletonLoader } from '@/page-layout/widgets/graph/components/ChartSkeletonLoader';
import { GraphWidgetChartHasTooManyGroupsEffect } from '@/page-layout/widgets/graph/components/GraphWidgetChartHasTooManyGroupsEffect';
import { useGraphPieChartWidgetData } from '@/page-layout/widgets/graph/graphWidgetPieChart/hooks/useGraphPieChartWidgetData';
import { type PieChartDataItem } from '@/page-layout/widgets/graph/graphWidgetPieChart/types/PieChartDataItem';
import { buildChartDrilldownQueryParams } from '@/page-layout/widgets/graph/utils/buildChartDrilldownQueryParams';
import { coreIndexViewIdFromObjectMetadataItemFamilySelector } from '@/views/states/selectors/coreIndexViewIdFromObjectMetadataItemFamilySelector';
import { lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { AppPath } from 'twenty-shared/types';
import { getAppPath } from 'twenty-shared/utils';
import {
  type PageLayoutWidget,
  type PieChartConfiguration,
} from '~/generated/graphql';

const GraphWidgetPieChart = lazy(() =>
  import(
    '@/page-layout/widgets/graph/graphWidgetPieChart/components/GraphWidgetPieChart'
  ).then((module) => ({
    default: module.GraphWidgetPieChart,
  })),
);

export const GraphWidgetPieChartRenderer = ({
  widget,
}: {
  widget: PageLayoutWidget;
}) => {
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
    configuration: widget.configuration as PieChartConfiguration,
  });

  const navigate = useNavigate();
  const configuration = widget.configuration as PieChartConfiguration;

  const indexViewId = useRecoilValue(
    coreIndexViewIdFromObjectMetadataItemFamilySelector({
      objectMetadataItemId: objectMetadataItem.id,
    }),
  );

  const handleSliceClick = (datum: PieChartDataItem) => {
    const rawValue = formattedToRawLookup.get(datum.id) ?? null;

    const drilldownQueryParams = buildChartDrilldownQueryParams({
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
        showLegend={showLegend}
        displayType="shortNumber"
        onSliceClick={handleSliceClick}
        showDataLabels={showDataLabels}
        showCenterMetric={showCenterMetric}
      />
    </Suspense>
  );
};
