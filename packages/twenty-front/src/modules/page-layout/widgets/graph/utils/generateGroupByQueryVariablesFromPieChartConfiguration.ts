import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getGroupByOrderBy } from '@/page-layout/widgets/graph/utils/getGroupByOrderBy';
import {
  type AggregateOrderByWithGroupByField,
  type ObjectRecordOrderByForCompositeField,
  type ObjectRecordOrderByForScalarField,
  type ObjectRecordOrderByWithGroupByDateField,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type PieChartConfiguration } from '~/generated/graphql';
import { buildGroupByFieldObject } from './buildGroupByFieldObject';

export const generateGroupByQueryVariablesFromPieChartConfiguration = ({
  objectMetadataItem,
  chartConfiguration,
  aggregateOperation,
  limit,
}: {
  objectMetadataItem: ObjectMetadataItem;
  chartConfiguration: PieChartConfiguration;
  aggregateOperation?: string;
  limit?: number;
}) => {
  const groupByFieldId = chartConfiguration.groupByFieldMetadataId;
  const groupBySubFieldName =
    chartConfiguration.groupBySubFieldName ?? undefined;
  const dateGranularity = chartConfiguration.dateGranularity ?? undefined;

  const groupByField = objectMetadataItem.fields.find(
    (field) => field.id === groupByFieldId,
  );

  if (!isDefined(groupByField) || !isDefined(groupByFieldId)) {
    throw new Error(
      `Field with id ${groupByFieldId} not found in object metadata`,
    );
  }

  const groupBy: Array<
    Record<string, boolean | Record<string, boolean | string>>
  > = [
    buildGroupByFieldObject({
      field: groupByField,
      subFieldName: groupBySubFieldName,
      dateGranularity,
    }),
  ];

  const orderBy: Array<
    | AggregateOrderByWithGroupByField
    | ObjectRecordOrderByForScalarField
    | ObjectRecordOrderByWithGroupByDateField
    | ObjectRecordOrderByForCompositeField
  > = [];

  if (isDefined(chartConfiguration.orderBy)) {
    orderBy.push(
      getGroupByOrderBy({
        graphOrderBy: chartConfiguration.orderBy,
        groupByField,
        groupBySubFieldName,
        aggregateOperation,
        dateGranularity,
      }),
    );
  }

  return {
    groupBy,
    ...(orderBy.length > 0 && { orderBy }),
    ...(isDefined(limit) && { limit }),
  };
};
