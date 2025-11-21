import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getGroupByOrderBy } from '@/page-layout/widgets/graph/utils/getGroupByOrderBy';
import {
  type AggregateOrderByWithGroupByField,
  type ObjectRecordOrderByForCompositeField,
  type ObjectRecordOrderByForScalarField,
  type ObjectRecordOrderByWithGroupByDateField,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import {
  type BarChartConfiguration,
  type LineChartConfiguration,
} from '~/generated/graphql';
import { buildGroupByFieldObject } from './buildGroupByFieldObject';

export const generateGroupByQueryVariablesFromBarOrLineChartConfiguration = ({
  objectMetadataItem,
  chartConfiguration,
  aggregateOperation,
  limit,
}: {
  objectMetadataItem: ObjectMetadataItem;
  chartConfiguration: BarChartConfiguration | LineChartConfiguration;
  aggregateOperation?: string;
  limit?: number;
}) => {
  const groupByFieldXId = chartConfiguration.primaryAxisGroupByFieldMetadataId;

  const groupByFieldYId =
    chartConfiguration.secondaryAxisGroupByFieldMetadataId;

  const groupBySubFieldNameX =
    chartConfiguration.primaryAxisGroupBySubFieldName ?? undefined;

  const groupBySubFieldNameY =
    chartConfiguration.secondaryAxisGroupBySubFieldName ?? undefined;

  const groupByFieldX = objectMetadataItem.fields.find(
    (field) => field.id === groupByFieldXId,
  );

  const groupByFieldY = isDefined(groupByFieldYId)
    ? objectMetadataItem.fields.find((field) => field.id === groupByFieldYId)
    : undefined;

  if (!isDefined(groupByFieldX) || !isDefined(groupByFieldXId)) {
    throw new Error(
      `Field with id ${groupByFieldXId} not found in object metadata`,
    );
  }

  const groupBy: Array<
    Record<string, boolean | Record<string, boolean | string>>
  > = [];

  groupBy.push(
    buildGroupByFieldObject({
      field: groupByFieldX,
      subFieldName: groupBySubFieldNameX,
      dateGranularity:
        chartConfiguration.primaryAxisDateGranularity ?? undefined,
    }),
  );

  if (isDefined(groupByFieldY)) {
    groupBy.push(
      buildGroupByFieldObject({
        field: groupByFieldY,
        subFieldName: groupBySubFieldNameY,
        dateGranularity:
          chartConfiguration.secondaryAxisGroupByDateGranularity ?? undefined,
      }),
    );
  }

  const orderBy: Array<
    | AggregateOrderByWithGroupByField
    | ObjectRecordOrderByForScalarField
    | ObjectRecordOrderByWithGroupByDateField
    | ObjectRecordOrderByForCompositeField
  > = [];

  if (isDefined(chartConfiguration.primaryAxisOrderBy)) {
    orderBy.push(
      getGroupByOrderBy({
        graphOrderBy: chartConfiguration.primaryAxisOrderBy,
        groupByField: groupByFieldX,
        groupBySubFieldName: chartConfiguration.primaryAxisGroupBySubFieldName,
        aggregateOperation,
        dateGranularity:
          chartConfiguration.primaryAxisDateGranularity ?? undefined,
      }),
    );
  }
  if (
    isDefined(groupByFieldY) &&
    isDefined(chartConfiguration.secondaryAxisOrderBy)
  ) {
    orderBy.push(
      getGroupByOrderBy({
        graphOrderBy: chartConfiguration.secondaryAxisOrderBy,
        groupByField: groupByFieldY,
        groupBySubFieldName:
          chartConfiguration.secondaryAxisGroupBySubFieldName,
        aggregateOperation,
        dateGranularity:
          chartConfiguration.secondaryAxisGroupByDateGranularity ?? undefined,
      }),
    );
  }

  return {
    groupBy,
    ...(orderBy.length > 0 && { orderBy }),
    ...(isDefined(limit) && { limit }),
  };
};
