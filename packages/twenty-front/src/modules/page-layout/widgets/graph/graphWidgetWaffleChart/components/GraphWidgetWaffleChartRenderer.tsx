import { isPageLayoutInEditModeComponentState } from '@/page-layout/states/isPageLayoutInEditModeComponentState';
import { ChartSkeletonLoader } from '@/page-layout/widgets/graph/components/ChartSkeletonLoader';
import { GraphWidgetChartHasTooManyGroupsEffect } from '@/page-layout/widgets/graph/components/GraphWidgetChartHasTooManyGroupsEffect';
import { useGraphWaffleChartWidgetData } from '@/page-layout/widgets/graph/graphWidgetWaffleChart/hooks/useGraphWaffleChartWidgetData';
import { type WaffleChartDataItem } from '@/page-layout/widgets/graph/graphWidgetWaffleChart/types/WaffleChartDataItem';
import { buildChartDrilldownQueryParams } from '@/page-layout/widgets/graph/utils/buildChartDrilldownQueryParams';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { coreIndexViewIdFromObjectMetadataItemFamilySelector } from '@/views/states/selectors/coreIndexViewIdFromObjectMetadataItemFamilySelector';
import { lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { AppPath } from 'twenty-shared/types';
import { getAppPath } from 'twenty-shared/utils';
import {
  type PageLayoutWidget,
  type WaffleChartConfiguration,
} from '~/generated/graphql';

const GraphWidgetWaffleChart = lazy(() =>
  import(
    '@/page-layout/widgets/graph/graphWidgetWaffleChart/components/GraphWidgetWaffleChart'
  ).then((module) => ({
    default: module.GraphWidgetWaffleChart,
  })),
);

export const GraphWidgetWaffleChartRenderer = ({
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
    formattedToRawLookup,
  } = useGraphWaffleChartWidgetData({
    objectMetadataItemId: widget.objectMetadataId,
    configuration: widget.configuration as WaffleChartConfiguration,
  });

  const navigate = useNavigate();
  const configuration = widget.configuration as WaffleChartConfiguration;

  const isPageLayoutInEditMode = useRecoilComponentValue(
    isPageLayoutInEditModeComponentState,
  );
  const indexViewId = useRecoilValue(
    coreIndexViewIdFromObjectMetadataItemFamilySelector({
      objectMetadataItemId: objectMetadataItem.id,
    }),
  );

  const handleSliceClick = (datum: WaffleChartDataItem) => {
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
      <GraphWidgetWaffleChart
        data={data}
        id={widget.id}
        objectMetadataItemId={widget.objectMetadataId}
        configuration={configuration}
        showLegend={showLegend}
        displayType="shortNumber"
        onSliceClick={isPageLayoutInEditMode ? undefined : handleSliceClick}
        showDataLabels={showDataLabels}
      />
    </Suspense>
  );
};
