import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { type FieldMetadataItemOption } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { PIE_CHART_DATA } from '@/page-layout/widgets/graph/graphql/queries/pieChartData';
import { type PieChartDataItem } from '@/page-layout/widgets/graph/graphWidgetPieChart/types/PieChartDataItem';
import { type GraphColorMode } from '@/page-layout/widgets/graph/types/GraphColorMode';
import { type RawDimensionValue } from '@/page-layout/widgets/graph/types/RawDimensionValue';
import { determineChartItemColor } from '@/page-layout/widgets/graph/utils/determineChartItemColor';
import { determineGraphColorMode } from '@/page-layout/widgets/graph/utils/determineGraphColorMode';
import { extractPieChartDataConfiguration } from '@/page-layout/widgets/graph/utils/extractPieChartDataConfiguration';
import { parseGraphColor } from '@/page-layout/widgets/graph/utils/parseGraphColor';
import { useQuery } from '@apollo/client';
import { useMemo } from 'react';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type PieChartConfiguration } from '~/generated/graphql';

type UseGraphPieChartWidgetDataProps = {
  objectMetadataItemId: string;
  configuration: PieChartConfiguration;
};

type UseGraphPieChartWidgetDataResult = {
  data: PieChartDataItem[];
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

  const apolloCoreClient = useApolloCoreClient();

  const dataConfiguration = useMemo(
    () => extractPieChartDataConfiguration(configuration),
    [configuration],
  );

  const {
    data: queryData,
    loading,
    error,
  } = useQuery(PIE_CHART_DATA, {
    client: apolloCoreClient,
    variables: {
      input: {
        objectMetadataId: objectMetadataItemId,
        configuration: dataConfiguration,
      },
    },
  });

  const formattedToRawLookup = useMemo((): Map<string, RawDimensionValue> => {
    const lookup = queryData?.pieChartData?.formattedToRawLookup;

    if (!lookup || typeof lookup !== 'object') {
      return new Map();
    }

    return new Map(Object.entries(lookup));
  }, [queryData?.pieChartData?.formattedToRawLookup]);

  const groupByField = useMemo(() => {
    return objectMetadataItem?.fields?.find(
      (field) => field.id === configuration.groupByFieldMetadataId,
    );
  }, [objectMetadataItem?.fields, configuration.groupByFieldMetadataId]);

  const selectFieldOptions = useMemo((): FieldMetadataItemOption[] | null => {
    if (!isDefined(groupByField)) {
      return null;
    }

    const isSelectField =
      groupByField.type === FieldMetadataType.SELECT ||
      groupByField.type === FieldMetadataType.MULTI_SELECT;

    if (!isSelectField || !isDefined(groupByField.options)) {
      return null;
    }

    return groupByField.options;
  }, [groupByField]);

  const configurationColor = useMemo(() => {
    return parseGraphColor(configuration.color);
  }, [configuration.color]);

  const colorMode = useMemo((): GraphColorMode => {
    return determineGraphColorMode({
      configurationColor,
      selectFieldOptions,
    });
  }, [configurationColor, selectFieldOptions]);

  const chartData = useMemo((): PieChartDataItem[] => {
    if (!queryData?.pieChartData?.data) {
      return [];
    }

    return queryData.pieChartData.data.map(
      (item: { id: string; value: number }): PieChartDataItem => {
        const rawValue = formattedToRawLookup.get(item.id);

        const itemColor = determineChartItemColor({
          configurationColor,
          selectOptions: selectFieldOptions,
          rawValue: typeof rawValue === 'string' ? rawValue : undefined,
        });

        return {
          id: item.id,
          value: item.value,
          color: itemColor,
        };
      },
    );
  }, [
    queryData?.pieChartData?.data,
    configurationColor,
    selectFieldOptions,
    formattedToRawLookup,
  ]);

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
