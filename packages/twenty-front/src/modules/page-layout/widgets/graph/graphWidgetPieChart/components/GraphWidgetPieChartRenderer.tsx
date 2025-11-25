import { ChartSkeletonLoader } from '@/page-layout/widgets/graph/components/ChartSkeletonLoader';
import { GraphWidgetChartHasTooManyGroupsEffect } from '@/page-layout/widgets/graph/components/GraphWidgetChartHasTooManyGroupsEffect';
import { useGraphPieChartWidgetData } from '@/page-layout/widgets/graph/graphWidgetPieChart/hooks/useGraphPieChartWidgetData';
import { type PieChartDataItem } from '@/page-layout/widgets/graph/graphWidgetPieChart/types/PieChartDataItem';
import { coreIndexViewIdFromObjectMetadataItemFamilySelector } from '@/views/states/selectors/coreIndexViewIdFromObjectMetadataItemFamilySelector';
import { lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { AppPath } from 'twenty-shared/types';
import { getAppPath, isDefined } from 'twenty-shared/utils';
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
  const { data, loading, hasTooManyGroups, objectMetadataItem } =
    useGraphPieChartWidgetData({
      objectMetadataItemId: widget.objectMetadataId,
      configuration: widget.configuration as PieChartConfiguration,
    });

  const navigate = useNavigate();

  const indexViewId = useRecoilValue(
    coreIndexViewIdFromObjectMetadataItemFamilySelector({
      objectMetadataItemId: objectMetadataItem.id,
    }),
  );

  const handleSliceClick = (_datum: PieChartDataItem) => {
    return navigate(
      getAppPath(
        AppPath.RecordIndexPage,
        {
          objectNamePlural: objectMetadataItem.namePlural,
        },
        isDefined(indexViewId) ? { viewId: indexViewId } : undefined,
      ),
    );
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
        displayType="shortNumber"
        onSliceClick={handleSliceClick}
      />
    </Suspense>
  );
};
