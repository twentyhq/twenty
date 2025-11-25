import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { LINE_CHART_MAXIMUM_NUMBER_OF_DATA_POINTS } from '@/page-layout/widgets/graph/graphWidgetLineChart/constants/LineChartMaximumNumberOfDataPoints.constant';
import { LINE_CHART_MAXIMUM_NUMBER_OF_SERIES } from '@/page-layout/widgets/graph/graphWidgetLineChart/constants/LineChartMaximumNumberOfSeries.constant';
import { type LineChartSeries } from '@/page-layout/widgets/graph/graphWidgetLineChart/types/LineChartSeries';
import { useGraphWidgetGroupByQuery } from '@/page-layout/widgets/graph/hooks/useGraphWidgetGroupByQuery';
import { isChartConfigurationTwoDimensionalStacked } from '@/page-layout/widgets/graph/utils/isChartConfigurationTwoDimensionalStacked';
import { transformGroupByDataToLineChartData } from '@/page-layout/widgets/graph/utils/transformGroupByDataToLineChartData';
import { useMemo } from 'react';
import { type LineChartConfiguration } from '~/generated/graphql';

type UseGraphLineChartWidgetDataProps = {
  objectMetadataItemId: string;
  configuration: LineChartConfiguration;
};

type UseGraphLineChartWidgetDataResult = {
  series: LineChartSeries[];
  xAxisLabel?: string;
  yAxisLabel?: string;
  showDataLabels: boolean;
  hasTooManyGroups: boolean;
  loading: boolean;
  error?: Error;
  objectMetadataItem: ObjectMetadataItem;
};

const EXTRA_ITEM_TO_DETECT_TOO_MANY_GROUPS = 1;

export const useGraphLineChartWidgetData = ({
  objectMetadataItemId,
  configuration,
}: UseGraphLineChartWidgetDataProps): UseGraphLineChartWidgetDataResult => {
  const { objectMetadataItem } = useObjectMetadataItemById({
    objectId: objectMetadataItemId,
  });

  const limit = isChartConfigurationTwoDimensionalStacked(configuration)
    ? LINE_CHART_MAXIMUM_NUMBER_OF_DATA_POINTS *
        LINE_CHART_MAXIMUM_NUMBER_OF_SERIES +
      EXTRA_ITEM_TO_DETECT_TOO_MANY_GROUPS
    : LINE_CHART_MAXIMUM_NUMBER_OF_DATA_POINTS +
      EXTRA_ITEM_TO_DETECT_TOO_MANY_GROUPS;

  const {
    data: groupByData,
    loading,
    error,
    aggregateOperation,
  } = useGraphWidgetGroupByQuery({
    objectMetadataItemId,
    configuration,
    limit,
  });

  const transformedData = useMemo(
    () =>
      transformGroupByDataToLineChartData({
        groupByData,
        objectMetadataItem,
        configuration,
        aggregateOperation,
      }),
    [groupByData, objectMetadataItem, configuration, aggregateOperation],
  );

  return {
    ...transformedData,
    objectMetadataItem,
    loading,
    error,
  };
};
