import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { GRAPH_MAXIMUM_NUMBER_OF_GROUPS } from '@/page-layout/widgets/graph/constants/GraphMaximumNumberOfGroups.constant';
import { type BarChartDataItem } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartDataItem';
import { type BarChartSeries } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartSeries';
import { type GraphColor } from '@/page-layout/widgets/graph/types/GraphColor';
import { isDefined } from 'twenty-shared/utils';
import { type BarChartConfiguration } from '~/generated/graphql';
import { computeAggregateFromGroupByResult } from './computeAggregateFromGroupByResult';
import { getGroupByQueryName } from './getGroupByQueryName';

type TransformGroupByDataToBarChartDataParams = {
  groupByData: Record<string, any> | null | undefined;
  objectMetadataItem: ObjectMetadataItem;
  configuration: BarChartConfiguration;
  aggregateOperation: string;
};

type TransformGroupByDataToBarChartDataResult = {
  data: BarChartDataItem[];
  indexBy: string;
  keys: string[];
  series: BarChartSeries[];
};

export const transformGroupByDataToBarChartData = ({
  groupByData,
  objectMetadataItem,
  configuration,
  aggregateOperation,
}: TransformGroupByDataToBarChartDataParams): TransformGroupByDataToBarChartDataResult => {
  if (!isDefined(groupByData)) {
    return {
      data: [],
      indexBy: '',
      keys: [],
      series: [],
    };
  }

  const groupByFieldX = objectMetadataItem.fields.find(
    (field: FieldMetadataItem) =>
      field.id === configuration.groupByFieldMetadataIdX,
  );

  const groupByFieldY = objectMetadataItem.fields.find(
    (field: FieldMetadataItem) =>
      field.id === configuration.groupByFieldMetadataIdY,
  );

  const aggregateField = objectMetadataItem.fields.find(
    (field: FieldMetadataItem) =>
      field.id === configuration.aggregateFieldMetadataId,
  );

  if (!isDefined(groupByFieldX) || !isDefined(aggregateField)) {
    return {
      data: [],
      indexBy: '',
      keys: [],
      series: [],
    };
  }

  const queryName = getGroupByQueryName(objectMetadataItem);
  // TODO: Add a limit to the query instead of slicing here
  const rawResults = groupByData[queryName].slice(
    0,
    GRAPH_MAXIMUM_NUMBER_OF_GROUPS,
  );

  if (!isDefined(rawResults) || !Array.isArray(rawResults)) {
    return {
      data: [],
      indexBy: groupByFieldX.name,
      keys: [],
      series: [],
    };
  }

  if (isDefined(groupByFieldY)) {
    const dataMap = new Map<string, BarChartDataItem>();
    const yValues = new Set<string>();

    rawResults.forEach((result: any) => {
      const dimensionValues = result.groupByDimensionValues;
      if (!isDefined(dimensionValues) || dimensionValues.length < 2) return;

      const xValue = String(dimensionValues[0]);
      const yValue = String(dimensionValues[1]);

      const aggregate = computeAggregateFromGroupByResult({
        rawResult: result,
        aggregateField,
        // TODO: fix typing
        aggregateOperation: configuration.aggregateOperation as any,
        aggregateOperationFromRawResult: aggregateOperation,
        objectMetadataItem,
      });

      yValues.add(yValue);

      if (!dataMap.has(xValue)) {
        dataMap.set(xValue, {
          [groupByFieldX.name]: xValue,
        });
      }

      const dataItem = dataMap.get(xValue)!;
      dataItem[yValue] = aggregate.value ?? 0;
    });

    const keys = Array.from(yValues);
    const series: BarChartSeries[] = keys.map((key) => ({
      key,
      label: key,
    }));

    return {
      data: Array.from(dataMap.values()),
      indexBy: groupByFieldX.name,
      keys,
      series,
    };
  }

  const data: BarChartDataItem[] = rawResults.map((result: any) => {
    const dimensionValues = result.groupByDimensionValues;

    const xValue = isDefined(dimensionValues?.[0])
      ? String(dimensionValues[0])
      : '';

    const aggregate = computeAggregateFromGroupByResult({
      rawResult: result,
      aggregateField,
      // TODO: fix typing
      aggregateOperation: configuration.aggregateOperation as any,
      aggregateOperationFromRawResult: aggregateOperation,
      objectMetadataItem,
    });

    return {
      [groupByFieldX.name]: xValue,
      [aggregateField.name]: aggregate.value ?? 0,
    };
  });

  const series: BarChartSeries[] = [
    {
      key: aggregateField.name,
      label: aggregateField.label,
      color: (isDefined(configuration.color)
        ? configuration.color
        : 'blue') as GraphColor,
    },
  ];

  return {
    data,
    indexBy: groupByFieldX.name,
    keys: [aggregateField.name],
    series,
  };
};
