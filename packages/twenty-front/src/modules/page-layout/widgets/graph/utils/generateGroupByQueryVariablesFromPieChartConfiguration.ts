import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { GRAPH_DEFAULT_DATE_GRANULARITY } from '@/page-layout/widgets/graph/constants/GraphDefaultDateGranularity';
import { getGroupByOrderBy } from '@/page-layout/widgets/graph/utils/getGroupByOrderBy';
import { isRelationNestedFieldDateKind } from '@/page-layout/widgets/graph/utils/isRelationNestedFieldDateKind';
import {
  type AggregateOrderByWithGroupByField,
  type ObjectRecordOrderByForCompositeField,
  type ObjectRecordOrderByForRelationField,
  type ObjectRecordOrderByForScalarField,
  type ObjectRecordOrderByWithGroupByDateField,
} from 'twenty-shared/types';
import { isDefined, isFieldMetadataDateKind } from 'twenty-shared/utils';
import { type PieChartConfiguration } from '~/generated/graphql';
import {
  buildGroupByFieldObject,
  type GroupByFieldObject,
} from './buildGroupByFieldObject';

export const generateGroupByQueryVariablesFromPieChartConfiguration = ({
  objectMetadataItem,
  objectMetadataItems,
  chartConfiguration,
  aggregateOperation,
  limit,
  firstDayOfTheWeek,
  userTimeZone,
}: {
  objectMetadataItem: ObjectMetadataItem;
  objectMetadataItems: ObjectMetadataItem[];
  chartConfiguration: PieChartConfiguration;
  aggregateOperation?: string;
  limit?: number;
  firstDayOfTheWeek?: number;
  userTimeZone?: string;
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

  const isFieldDate = isFieldMetadataDateKind(groupByField.type);

  const isNestedDate = isRelationNestedFieldDateKind({
    relationField: groupByField,
    relationNestedFieldName: groupBySubFieldName,
    objectMetadataItems,
  });

  const shouldApplyDateGranularity = isFieldDate || isNestedDate;

  const groupBy: Array<GroupByFieldObject> = [
    buildGroupByFieldObject({
      field: groupByField,
      subFieldName: groupBySubFieldName,
      dateGranularity: shouldApplyDateGranularity
        ? (dateGranularity ?? GRAPH_DEFAULT_DATE_GRANULARITY)
        : undefined,
      firstDayOfTheWeek,
      isNestedDateField: isNestedDate,
      timeZone: userTimeZone,
    }),
  ];

  const orderBy: Array<
    | AggregateOrderByWithGroupByField
    | ObjectRecordOrderByForScalarField
    | ObjectRecordOrderByWithGroupByDateField
    | ObjectRecordOrderByForCompositeField
    | ObjectRecordOrderByForRelationField
  > = [];

  if (isDefined(chartConfiguration.orderBy)) {
    const orderByItem = getGroupByOrderBy({
      graphOrderBy: chartConfiguration.orderBy,
      groupByField,
      groupBySubFieldName,
      aggregateOperation,
      dateGranularity: shouldApplyDateGranularity
        ? (dateGranularity ?? GRAPH_DEFAULT_DATE_GRANULARITY)
        : undefined,
    });

    if (isDefined(orderByItem)) {
      orderBy.push(orderByItem);
    }
  }

  return {
    groupBy,
    ...(orderBy.length > 0 && { orderBy }),
    ...(isDefined(limit) && { limit }),
  };
};
