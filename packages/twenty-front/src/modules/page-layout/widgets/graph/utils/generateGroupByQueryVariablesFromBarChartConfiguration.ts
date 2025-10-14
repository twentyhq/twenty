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
  const groupByFieldX = objectMetadataItem.fields.find(
    (field) => field.id === barChartConfiguration.groupByFieldMetadataIdX,
  );

  const groupByFieldY = objectMetadataItem.fields.find(
    (field) => field.id === barChartConfiguration.groupByFieldMetadataIdY,
  );

  if (!isDefined(groupByFieldX)) {
    throw new Error(
      `Field with id ${barChartConfiguration.groupByFieldMetadataIdX} not found in object metadata`,
    );
  }

  const groupBy: Array<
    Record<string, boolean | Record<string, boolean | string>>
  > = [];

  groupBy.push(
    buildGroupByFieldObject({
      field: groupByFieldX,
      subFieldName: barChartConfiguration.groupBySubFieldNameX,
    }),
  );

  if (isDefined(groupByFieldY)) {
    groupBy.push(
      buildGroupByFieldObject({
        field: groupByFieldY,
        subFieldName: barChartConfiguration.groupBySubFieldNameY,
      }),
    );
  }

  const orderBy: Array<
    | AggregateOrderByWithGroupByField
    | ObjectRecordOrderByForScalarField
    | ObjectRecordOrderByWithGroupByDateField
    | ObjectRecordOrderByForCompositeField
  > = [];

  if (isDefined(barChartConfiguration.orderByX)) {
    orderBy.push(
      getGroupByOrderBy({
        graphOrderBy: barChartConfiguration.orderByX,
        groupByField: groupByFieldX,
        groupBySubFieldName: barChartConfiguration.groupBySubFieldNameX,
        aggregateOperation,
      }),
    );
  }
  if (isDefined(groupByFieldY) && isDefined(barChartConfiguration.orderByY)) {
    orderBy.push(
      getGroupByOrderBy({
        graphOrderBy: barChartConfiguration.orderByY,
        groupByField: groupByFieldY,
        groupBySubFieldName: barChartConfiguration.groupBySubFieldNameY,
        aggregateOperation,
      }),
    );
  }

  return {
    groupBy,
    ...(orderBy.length > 0 && { orderBy }),
  };
};
