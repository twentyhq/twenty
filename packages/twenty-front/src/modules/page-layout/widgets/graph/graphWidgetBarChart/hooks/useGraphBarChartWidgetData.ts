import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { type FieldMetadataItemOption } from '@/object-metadata/types/FieldMetadataItem';
import { BAR_CHART_DATA } from '@/page-layout/widgets/graph/graphql/queries/barChartData';
import { type BarChartSeries } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartSeries';
import { type GraphColorMode } from '@/page-layout/widgets/graph/types/GraphColorMode';
import { type RawDimensionValue } from '@/page-layout/widgets/graph/types/RawDimensionValue';
import { determineChartItemColor } from '@/page-layout/widgets/graph/utils/determineChartItemColor';
import { determineGraphColorMode } from '@/page-layout/widgets/graph/utils/determineGraphColorMode';
import { extractBarChartDataConfiguration } from '@/page-layout/widgets/graph/utils/extractBarChartDataConfiguration';
import { parseGraphColor } from '@/page-layout/widgets/graph/utils/parseGraphColor';
import { useQuery } from '@apollo/client';
import { type BarDatum } from '@nivo/bar';
import { useMemo } from 'react';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import {
  type BarChartConfiguration,
  type BarChartLayout,
} from '~/generated/graphql';

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
  colorMode: GraphColorMode;
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

  const apolloCoreClient = useApolloCoreClient();

  const dataConfiguration = useMemo(
    () => extractBarChartDataConfiguration(configuration),
    [configuration],
  );

  const {
    data: queryData,
    loading,
    error,
  } = useQuery(BAR_CHART_DATA, {
    client: apolloCoreClient,
    variables: {
      input: {
        objectMetadataId: objectMetadataItemId,
        configuration: dataConfiguration,
      },
    },
  });

  const chartData = useMemo((): BarDatum[] => {
    if (!queryData?.barChartData?.data) {
      return [];
    }

    return queryData.barChartData.data as BarDatum[];
  }, [queryData?.barChartData?.data]);

  const formattedToRawLookup = useMemo((): Map<string, RawDimensionValue> => {
    const lookup = queryData?.barChartData?.formattedToRawLookup;

    if (!lookup || typeof lookup !== 'object') {
      return new Map();
    }

    return new Map(Object.entries(lookup));
  }, [queryData?.barChartData?.formattedToRawLookup]);

  const colorDeterminingFieldId = useMemo(() => {
    return isDefined(configuration.secondaryAxisGroupByFieldMetadataId)
      ? configuration.secondaryAxisGroupByFieldMetadataId
      : configuration.primaryAxisGroupByFieldMetadataId;
  }, [
    configuration.secondaryAxisGroupByFieldMetadataId,
    configuration.primaryAxisGroupByFieldMetadataId,
  ]);

  const colorDeterminingField = useMemo(() => {
    return objectMetadataItem?.fields?.find(
      (field) => field.id === colorDeterminingFieldId,
    );
  }, [objectMetadataItem?.fields, colorDeterminingFieldId]);

  const selectFieldOptions = useMemo((): FieldMetadataItemOption[] | null => {
    if (!isDefined(colorDeterminingField)) {
      return null;
    }

    const isSelectField =
      colorDeterminingField.type === FieldMetadataType.SELECT ||
      colorDeterminingField.type === FieldMetadataType.MULTI_SELECT;

    if (!isSelectField || !isDefined(colorDeterminingField.options)) {
      return null;
    }

    return colorDeterminingField.options;
  }, [colorDeterminingField]);

  const configurationColor = useMemo(() => {
    return parseGraphColor(configuration.color);
  }, [configuration.color]);

  const colorMode = useMemo((): GraphColorMode => {
    return determineGraphColorMode({
      configurationColor,
      selectFieldOptions,
    });
  }, [configurationColor, selectFieldOptions]);

  const series = useMemo((): BarChartSeries[] => {
    if (!queryData?.barChartData?.series) {
      return [];
    }

    return queryData.barChartData.series.map(
      (seriesItem: { key: string; label?: string }): BarChartSeries => {
        const rawValue = formattedToRawLookup.get(seriesItem.key);

        const itemColor = determineChartItemColor({
          configurationColor,
          selectOptions: selectFieldOptions,
          rawValue: typeof rawValue === 'string' ? rawValue : undefined,
        });

        return {
          key: seriesItem.key,
          label: seriesItem.label,
          color: itemColor,
        };
      },
    );
  }, [
    queryData?.barChartData?.series,
    configurationColor,
    selectFieldOptions,
    formattedToRawLookup,
  ]);

  return {
    data: chartData,
    indexBy: queryData?.barChartData?.indexBy ?? 'id',
    keys: queryData?.barChartData?.keys ?? [],
    series,
    xAxisLabel: queryData?.barChartData?.xAxisLabel,
    yAxisLabel: queryData?.barChartData?.yAxisLabel,
    showDataLabels: configuration.displayDataLabel ?? false,
    showLegend: configuration.displayLegend ?? true,
    layout: queryData?.barChartData?.layout,
    hasTooManyGroups: queryData?.barChartData?.hasTooManyGroups ?? false,
    colorMode,
    formattedToRawLookup,
    objectMetadataItem,
    loading,
    error,
  };
};
