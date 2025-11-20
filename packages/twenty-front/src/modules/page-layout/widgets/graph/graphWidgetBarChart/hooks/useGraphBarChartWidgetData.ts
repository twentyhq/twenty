import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { type BarChartLayout } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartLayout';
import { type BarChartSeries } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartSeries';
import { useGraphWidgetGroupByQuery } from '@/page-layout/widgets/graph/hooks/useGraphWidgetGroupByQuery';
import { type RawDimensionValue } from '@/page-layout/widgets/graph/types/RawDimensionValue';
import { transformGroupByDataToBarChartData } from '@/page-layout/widgets/graph/utils/transformGroupByDataToBarChartData';
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
  layout?: BarChartLayout;
  loading: boolean;
  error?: Error;
  hasTooManyGroups: boolean;
  dimensionMetadata: Map<string, RawDimensionValue>;
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

  const {
    data: groupByData,
    loading,
    error,
    aggregateOperation,
  } = useGraphWidgetGroupByQuery({
    objectMetadataItemId,
    configuration,
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
    loading,
    error,
    objectMetadataItem,
  };
};
