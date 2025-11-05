import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getGroupByOrderBy } from '@/page-layout/widgets/graph/utils/getGroupByOrderBy';
import {
  type AggregateOrderByWithGroupByField,
  type ObjectRecordOrderByForCompositeField,
  type ObjectRecordOrderByForScalarField,
  type ObjectRecordOrderByWithGroupByDateField,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type LineChartConfiguration } from '~/generated/graphql';
import { buildGroupByFieldObject } from './buildGroupByFieldObject';

export const generateGroupByQueryVariablesFromLineChartConfiguration = ({
  objectMetadataItem,
  lineChartConfiguration,
  aggregateOperation,
}: {
  objectMetadataItem: ObjectMetadataItem;
  lineChartConfiguration: LineChartConfiguration;
  aggregateOperation?: string;
}) => {
  const groupByFieldXId =
    lineChartConfiguration.primaryAxisGroupByFieldMetadataId;

  const groupByFieldYId =
    lineChartConfiguration.secondaryAxisGroupByFieldMetadataId;

  const groupBySubFieldNameX =
    lineChartConfiguration.primaryAxisGroupBySubFieldName ?? undefined;

  const groupBySubFieldNameY =
    lineChartConfiguration.secondaryAxisGroupBySubFieldName ?? undefined;

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
        lineChartConfiguration.primaryAxisDateGranularity ?? undefined,
    }),
  );

  if (isDefined(groupByFieldY)) {
    groupBy.push(
      buildGroupByFieldObject({
        field: groupByFieldY,
        subFieldName: groupBySubFieldNameY,
        dateGranularity:
          lineChartConfiguration.secondaryAxisGroupByDateGranularity ??
          undefined,
      }),
    );
  }

  const orderBy: Array<
    | AggregateOrderByWithGroupByField
    | ObjectRecordOrderByForScalarField
    | ObjectRecordOrderByWithGroupByDateField
    | ObjectRecordOrderByForCompositeField
  > = [];

  if (isDefined(lineChartConfiguration.primaryAxisOrderBy)) {
    orderBy.push(
      getGroupByOrderBy({
        graphOrderBy: lineChartConfiguration.primaryAxisOrderBy,
        groupByField: groupByFieldX,
        groupBySubFieldName:
          lineChartConfiguration.primaryAxisGroupBySubFieldName,
        aggregateOperation,
        dateGranularity:
          lineChartConfiguration.primaryAxisDateGranularity ?? undefined,
      }),
    );
  }
  if (
    isDefined(groupByFieldY) &&
    isDefined(lineChartConfiguration.secondaryAxisOrderBy)
  ) {
    orderBy.push(
      getGroupByOrderBy({
        graphOrderBy: lineChartConfiguration.secondaryAxisOrderBy,
        groupByField: groupByFieldY,
        groupBySubFieldName:
          lineChartConfiguration.secondaryAxisGroupBySubFieldName,
        aggregateOperation,
        dateGranularity:
          lineChartConfiguration.secondaryAxisGroupByDateGranularity ??
          undefined,
      }),
    );
  }

  return {
    groupBy,
    ...(orderBy.length > 0 && { orderBy }),
  };
};
