import { ChartSkeletonLoader } from '@/page-layout/widgets/graph/components/ChartSkeletonLoader';
import { GraphWidgetChartHasTooManyGroupsEffect } from '@/page-layout/widgets/graph/components/GraphWidgetChartHasTooManyGroupsEffect';
import { useGraphBarChartWidgetData } from '@/page-layout/widgets/graph/graphWidgetBarChart/hooks/useGraphBarChartWidgetData';
import { type BarChartDataItem } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartDataItem';
import { getEffectiveGroupMode } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/getEffectiveGroupMode';
import { buildChartDrilldownQueryParams } from '@/page-layout/widgets/graph/utils/buildChartDrilldownQueryParams';
import { generateChartAggregateFilterKey } from '@/page-layout/widgets/graph/utils/generateChartAggregateFilterKey';
import { isPageLayoutInEditModeComponentState } from '@/page-layout/states/isPageLayoutInEditModeComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { coreIndexViewIdFromObjectMetadataItemFamilySelector } from '@/views/states/selectors/coreIndexViewIdFromObjectMetadataItemFamilySelector';
import { type ComputedDatum } from '@nivo/bar';
import { lazy, Suspense } from 'react';
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
    formattedToRawLookup,
    objectMetadataItem,
  } = useGraphBarChartWidgetData({
    objectMetadataItemId: widget.objectMetadataId,
    configuration: widget.configuration as BarChartConfiguration,
  });

  const navigate = useNavigate();
  const configuration = widget.configuration as BarChartConfiguration;
  const isPageLayoutInEditMode = useRecoilComponentValue(
    isPageLayoutInEditModeComponentState,
  );

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

  const handleBarClick = (datum: ComputedDatum<BarChartDataItem>) => {
    const displayValue = datum.data[indexBy];
    const rawValue = formattedToRawLookup.get(displayValue as string) ?? null;

    const queryParams = buildChartDrilldownQueryParams({
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
        onBarClick={isPageLayoutInEditMode ? undefined : handleBarClick}
      />
    </Suspense>
  );
};
