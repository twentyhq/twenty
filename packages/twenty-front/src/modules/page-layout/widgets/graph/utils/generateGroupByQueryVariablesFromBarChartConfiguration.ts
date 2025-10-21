import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getGroupByOrderBy } from '@/page-layout/widgets/graph/utils/getGroupByOrderBy';
import {
  type AggregateOrderByWithGroupByField,
  type ObjectRecordOrderByForCompositeField,
  type ObjectRecordOrderByForScalarField,
  type ObjectRecordOrderByWithGroupByDateField,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type BarChartConfiguration } from '~/generated/graphql';
import { buildGroupByFieldObject } from './buildGroupByFieldObject';

export const generateGroupByQueryVariablesFromBarChartConfiguration = ({
  objectMetadataItem,
  barChartConfiguration,
  aggregateOperation,
}: {
  objectMetadataItem: ObjectMetadataItem;
  barChartConfiguration: BarChartConfiguration;
  aggregateOperation?: string;
}) => {
  const groupByFieldXId =
    barChartConfiguration.primaryAxisGroupByFieldMetadataId;

  const groupByFieldYId =
    barChartConfiguration.secondaryAxisGroupByFieldMetadataId;

  const groupBySubFieldNameX =
    barChartConfiguration.primaryAxisGroupBySubFieldName ?? undefined;

  const groupBySubFieldNameY =
    barChartConfiguration.secondaryAxisGroupBySubFieldName ?? undefined;

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
    }),
  );

  if (isDefined(groupByFieldY)) {
    groupBy.push(
      buildGroupByFieldObject({
        field: groupByFieldY,
        subFieldName: groupBySubFieldNameY,
      }),
    );
  }

  const orderBy: Array<
    | AggregateOrderByWithGroupByField
    | ObjectRecordOrderByForScalarField
    | ObjectRecordOrderByWithGroupByDateField
    | ObjectRecordOrderByForCompositeField
  > = [];

  if (isDefined(barChartConfiguration.primaryAxisOrderBy)) {
    orderBy.push(
      getGroupByOrderBy({
        graphOrderBy: barChartConfiguration.primaryAxisOrderBy,
        groupByField: groupByFieldX,
        groupBySubFieldName:
          barChartConfiguration.primaryAxisGroupBySubFieldName,
        aggregateOperation,
      }),
    );
  }
  if (
    isDefined(groupByFieldY) &&
    isDefined(barChartConfiguration.secondaryAxisOrderBy)
  ) {
    orderBy.push(
      getGroupByOrderBy({
        graphOrderBy: barChartConfiguration.secondaryAxisOrderBy,
        groupByField: groupByFieldY,
        groupBySubFieldName:
          barChartConfiguration.secondaryAxisGroupBySubFieldName,
        aggregateOperation,
      }),
    );
  }

  return {
    groupBy,
    ...(orderBy.length > 0 && { orderBy }),
    ...(barChartConfiguration.omitNullValues ? { omitNullValues: true } : {}),
  };
};
