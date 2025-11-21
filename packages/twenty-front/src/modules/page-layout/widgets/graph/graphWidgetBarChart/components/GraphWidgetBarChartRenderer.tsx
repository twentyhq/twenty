import { ChartSkeletonLoader } from '@/page-layout/widgets/graph/components/ChartSkeletonLoader';
import { GraphWidgetChartHasTooManyGroupsEffect } from '@/page-layout/widgets/graph/components/GraphWidgetChartHasTooManyGroupsEffect';
import { useGraphBarChartWidgetData } from '@/page-layout/widgets/graph/graphWidgetBarChart/hooks/useGraphBarChartWidgetData';
import { getEffectiveGroupMode } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/getEffectiveGroupMode';
import { generateChartAggregateFilterKey } from '@/page-layout/widgets/graph/utils/generateChartAggregateFilterKey';
import { type BarChartDataItem } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartDataItem';
import { coreIndexViewIdFromObjectMetadataItemFamilySelector } from '@/views/states/selectors/coreIndexViewIdFromObjectMetadataItemFamilySelector';
import { type ComputedDatum } from '@nivo/bar';
import { lazy, Suspense, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { AppPath } from 'twenty-shared/types';
import { getAppPath, isDefined } from 'twenty-shared/utils';
import {
  type BarChartConfiguration,
  type PageLayoutWidget,
} from '~/generated/graphql';

const GraphWidgetBarChart = lazy(() =>
  import(
    '@/page-layout/widgets/graph/graphWidgetBarChart/components/GraphWidgetBarChart'
  ).then((module) => ({
    default: module.GraphWidgetBarChart,
  })),
);

export const GraphWidgetBarChartRenderer = ({
  widget,
}: {
  widget: PageLayoutWidget;
}) => {
  const {
    data,
    indexBy,
    keys,
    series,
    xAxisLabel,
    yAxisLabel,
    showDataLabels,
    layout,
    loading,
    hasTooManyGroups,
    objectMetadataItem,
  } = useGraphBarChartWidgetData({
    objectMetadataItemId: widget.objectMetadataId,
    configuration: widget.configuration as BarChartConfiguration,
  });

  const navigate = useNavigate();
  const configuration = widget.configuration as BarChartConfiguration;

  const hasGroupByOnSecondaryAxis = isDefined(
    configuration.secondaryAxisGroupByFieldMetadataId,
  );
  const groupMode = getEffectiveGroupMode(
    configuration.groupMode,
    hasGroupByOnSecondaryAxis,
  );
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

  const handleBarClick = useCallback(
    (_datum: ComputedDatum<BarChartDataItem>) => {
      navigate(
        getAppPath(
          AppPath.RecordIndexPage,
          {
            objectNamePlural: objectMetadataItem.namePlural,
          },
          indexViewId ? { viewId: indexViewId } : undefined,
        ),
      );
    },
    [navigate, objectMetadataItem.namePlural, indexViewId],
  );

  if (loading) {
    return <ChartSkeletonLoader />;
  }

  return (
    <Suspense fallback={<ChartSkeletonLoader />}>
      <GraphWidgetChartHasTooManyGroupsEffect
        hasTooManyGroups={hasTooManyGroups}
      />
      <GraphWidgetBarChart
        key={chartFilterKey}
        data={data}
        series={series}
        indexBy={indexBy}
        keys={keys}
        xAxisLabel={xAxisLabel}
        yAxisLabel={yAxisLabel}
        showValues={showDataLabels}
        layout={layout}
        groupMode={groupMode}
        id={widget.id}
        displayType="shortNumber"
        rangeMin={configuration.rangeMin ?? undefined}
        rangeMax={configuration.rangeMax ?? undefined}
        omitNullValues={configuration.omitNullValues ?? false}
        onBarClick={handleBarClick}
      />
    </Suspense>
  );
};
