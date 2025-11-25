import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { type BarChartLayout } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartLayout';
import { type BarChartSeries } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartSeries';
import { getBarChartQueryLimit } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/getBarChartQueryLimit';
import { transformGroupByDataToBarChartData } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/transformGroupByDataToBarChartData';
import { useGraphWidgetGroupByQuery } from '@/page-layout/widgets/graph/hooks/useGraphWidgetGroupByQuery';
import { type RawDimensionValue } from '@/page-layout/widgets/graph/types/RawDimensionValue';
import { type BarDatum } from '@nivo/bar';
import { useMemo } from 'react';
import { type BarChartConfiguration } from '~/generated/graphql';

type UseGraphBarChartWidgetDataProps = {
  objectMetadataItemId: string;
  configuration: BarChartConfiguration;
};

type UseGraphBarChartWidgetDataResult = {
  data: BarDatum[];
  indexBy: string;
  keys: string[];
  series: BarChartSeries[];
  xAxisLabel?: string;
  yAxisLabel?: string;
  showDataLabels: boolean;
  showLegend: boolean;
  layout?: BarChartLayout;
  loading: boolean;
  error?: Error;
  hasTooManyGroups: boolean;
  formattedToRawLookup: Map<string, RawDimensionValue>;
  objectMetadataItem: ReturnType<
    typeof useObjectMetadataItemById
  >['objectMetadataItem'];
};

export const useGraphBarChartWidgetData = ({
  objectMetadataItemId,
  configuration,
}: UseGraphBarChartWidgetDataProps): UseGraphBarChartWidgetDataResult => {
  const { objectMetadataItem } = useObjectMetadataItemById({
    objectId: objectMetadataItemId,
  });

  const limit = getBarChartQueryLimit(configuration);

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
      transformGroupByDataToBarChartData({
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
