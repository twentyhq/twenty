import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { type FieldMetadataItemOption } from '@/object-metadata/types/FieldMetadataItem';
import { BAR_CHART_DATA } from '@/page-layout/widgets/graph/graphql/queries/barChartData';
import { type BarChartSeriesWithColor } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartSeries';
import { getEffectiveGroupMode } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/getEffectiveGroupMode';
import { type BarChartDatum } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartDatum';
import { type GraphColorMode } from '@/page-layout/widgets/graph/types/GraphColorMode';
import { type RawDimensionValue } from '@/page-layout/widgets/graph/types/RawDimensionValue';
import { determineChartItemColor } from '@/page-layout/widgets/graph/utils/determineChartItemColor';
import { determineGraphColorMode } from '@/page-layout/widgets/graph/utils/determineGraphColorMode';
import { extractBarChartDataConfiguration } from '@/page-layout/widgets/graph/utils/extractBarChartDataConfiguration';
import { parseGraphColor } from '@/page-layout/widgets/graph/utils/parseGraphColor';
import { useQuery } from '@apollo/client';
import { isString } from '@sniptt/guards';
import { useMemo } from 'react';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import {
  type BarChartConfiguration,
  type BarChartLayout,
  type BarChartSeries,
} from '~/generated-metadata/graphql';

type UseGraphBarChartWidgetDataProps = {
  objectMetadataItemId: string;
  configuration: BarChartConfiguration;
};

type UseGraphBarChartWidgetDataResult = {
  data: BarChartDatum[];
  indexBy: string;
  keys: string[];
  series: BarChartSeriesWithColor[];
  xAxisLabel: string;
  yAxisLabel: string;
  showDataLabels: boolean;
  showLegend: boolean;
  layout?: BarChartLayout;
  groupMode: 'grouped' | 'stacked' | undefined;
  loading: boolean;
  isRefetching: boolean;
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

  const dataConfiguration = useMemo(
    () => extractBarChartDataConfiguration(configuration),
    [configuration],
  );

  const {
    data: queryData,
    previousData,
    loading,
    error,
  } = useQuery(BAR_CHART_DATA, {
    variables: {
      input: {
        objectMetadataId: objectMetadataItemId,
        configuration: dataConfiguration,
      },
    },
  });

  const effectiveQueryData = queryData ?? previousData;

  const indexBy = effectiveQueryData?.barChartData?.indexBy ?? 'id';
  const keys = effectiveQueryData?.barChartData?.keys ?? [];
  const chartData =
    (effectiveQueryData?.barChartData?.data as BarChartDatum[]) ?? [];

  const formattedToRawLookup = effectiveQueryData?.barChartData
    ?.formattedToRawLookup
    ? new Map(
        Object.entries(effectiveQueryData.barChartData.formattedToRawLookup),
      )
    : new Map();

  const colorDeterminingFieldId = isDefined(
    configuration.secondaryAxisGroupByFieldMetadataId,
  )
    ? configuration.secondaryAxisGroupByFieldMetadataId
    : configuration.primaryAxisGroupByFieldMetadataId;

  const colorDeterminingField = objectMetadataItem?.fields?.find(
    (field) => field.id === colorDeterminingFieldId,
  );

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

  const configurationColor = parseGraphColor(configuration.color);

  const colorMode = determineGraphColorMode({
    configurationColor,
    selectFieldOptions,
  });

  const series = effectiveQueryData?.barChartData?.series?.map(
    (seriesItem: BarChartSeries): BarChartSeriesWithColor => {
      const rawValue = formattedToRawLookup.get(seriesItem.key);

      const itemColor = determineChartItemColor({
        configurationColor,
        selectOptions: selectFieldOptions,
        rawValue: isString(rawValue) ? rawValue : undefined,
      });

      return {
        key: seriesItem.key,
        label: seriesItem.label,
        color: itemColor,
      };
    },
  );

  return {
    data: chartData,
    indexBy,
    keys,
    series,
    xAxisLabel: effectiveQueryData?.barChartData?.xAxisLabel ?? '',
    yAxisLabel: effectiveQueryData?.barChartData?.yAxisLabel ?? '',
    showDataLabels: configuration.displayDataLabel ?? false,
    showLegend: configuration.displayLegend ?? true,
    layout: effectiveQueryData?.barChartData?.layout,
    groupMode: getEffectiveGroupMode(
      configuration.groupMode,
      isDefined(configuration.secondaryAxisGroupByFieldMetadataId),
    ),
    hasTooManyGroups:
      effectiveQueryData?.barChartData?.hasTooManyGroups ?? false,
    colorMode,
    formattedToRawLookup,
    objectMetadataItem,
    loading: loading && !previousData,
    isRefetching: loading && !!previousData,
    error,
  };
};
