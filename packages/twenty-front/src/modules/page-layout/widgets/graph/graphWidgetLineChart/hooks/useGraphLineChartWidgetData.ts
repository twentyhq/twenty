import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { type LineChartSeries } from '@/page-layout/widgets/graph/graphWidgetLineChart/types/LineChartSeries';
import { getLineChartQueryLimit } from '@/page-layout/widgets/graph/graphWidgetLineChart/utils/getLineChartQueryLimit';
import { useGraphWidgetGroupByQuery } from '@/page-layout/widgets/graph/hooks/useGraphWidgetGroupByQuery';
import { type RawDimensionValue } from '@/page-layout/widgets/graph/types/RawDimensionValue';
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
  formattedToRawLookup: Map<string, RawDimensionValue>;
  loading: boolean;
  error?: Error;
  objectMetadataItem: ReturnType<
    typeof useObjectMetadataItemById
  >['objectMetadataItem'];
};

export const useGraphLineChartWidgetData = ({
  objectMetadataItemId,
  configuration,
}: UseGraphLineChartWidgetDataProps): UseGraphLineChartWidgetDataResult => {
  const { objectMetadataItem } = useObjectMetadataItemById({
    objectId: objectMetadataItemId,
  });

  const limit = getLineChartQueryLimit(configuration);

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
