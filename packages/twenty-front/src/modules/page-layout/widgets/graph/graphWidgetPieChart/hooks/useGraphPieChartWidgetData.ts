import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { PIE_CHART_DATA } from '@/page-layout/widgets/graph/graphql/queries/pieChartData';
import { type PieChartDataItemWithColor } from '@/page-layout/widgets/graph/graphWidgetPieChart/types/PieChartDataItem';
import { type GraphColorMode } from '@/page-layout/widgets/graph/types/GraphColorMode';
import { type RawDimensionValue } from '@/page-layout/widgets/graph/types/RawDimensionValue';
import { determineChartItemColor } from '@/page-layout/widgets/graph/utils/determineChartItemColor';
import { determineGraphColorMode } from '@/page-layout/widgets/graph/utils/determineGraphColorMode';
import { extractPieChartDataConfiguration } from '@/page-layout/widgets/graph/utils/extractPieChartDataConfiguration';
import { parseGraphColor } from '@/page-layout/widgets/graph/utils/parseGraphColor';
import { useQuery } from '@apollo/client';
import { isString } from '@sniptt/guards';
import { useMemo } from 'react';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type PieChartConfiguration } from '~/generated-metadata/graphql';

type UseGraphPieChartWidgetDataProps = {
  objectMetadataItemId: string;
  configuration: PieChartConfiguration;
};

type UseGraphPieChartWidgetDataResult = {
  data: PieChartDataItemWithColor[];
  showLegend: boolean;
  loading: boolean;
  error?: Error;
  hasTooManyGroups: boolean;
  objectMetadataItem: ObjectMetadataItem;
  formattedToRawLookup: Map<string, RawDimensionValue>;
  colorMode: GraphColorMode;
  showDataLabels: boolean;
  showCenterMetric: boolean;
};

export const useGraphPieChartWidgetData = ({
  objectMetadataItemId,
  configuration,
}: UseGraphPieChartWidgetDataProps): UseGraphPieChartWidgetDataResult => {
  const { objectMetadataItem } = useObjectMetadataItemById({
    objectId: objectMetadataItemId,
  });

  const dataConfiguration = useMemo(
    () => extractPieChartDataConfiguration(configuration),
    [configuration],
  );

  const {
    data: queryData,
    loading,
    error,
  } = useQuery(PIE_CHART_DATA, {
    variables: {
      input: {
        objectMetadataId: objectMetadataItemId,
        configuration: dataConfiguration,
      },
    },
  });

  const formattedToRawLookup = queryData?.pieChartData?.formattedToRawLookup
    ? new Map(Object.entries(queryData.pieChartData.formattedToRawLookup))
    : new Map();

  const groupByField = objectMetadataItem?.fields?.find(
    (field) => field.id === configuration.groupByFieldMetadataId,
  );

  const selectFieldOptions =
    isDefined(groupByField) &&
    (groupByField.type === FieldMetadataType.SELECT ||
      groupByField.type === FieldMetadataType.MULTI_SELECT)
      ? groupByField.options
      : null;

  const configurationColor = parseGraphColor(configuration.color);

  const colorMode = determineGraphColorMode({
    configurationColor,
    selectFieldOptions,
  });

  const chartData = queryData?.pieChartData?.data?.map(
    (item: PieChartDataItemWithColor): PieChartDataItemWithColor => {
      const rawValue = formattedToRawLookup.get(item.id);

      const itemColor = determineChartItemColor({
        configurationColor,
        selectOptions: selectFieldOptions,
        rawValue: isString(rawValue) ? rawValue : undefined,
      });

      return {
        id: item.id,
        value: item.value,
        color: itemColor,
      };
    },
  );

  return {
    data: chartData,
    showLegend: configuration.displayLegend ?? true,
    showDataLabels: configuration.displayDataLabel ?? false,
    showCenterMetric: configuration.showCenterMetric ?? true,
    hasTooManyGroups: queryData?.pieChartData?.hasTooManyGroups ?? false,
    colorMode,
    formattedToRawLookup,
    objectMetadataItem,
    loading,
    error,
  };
};
