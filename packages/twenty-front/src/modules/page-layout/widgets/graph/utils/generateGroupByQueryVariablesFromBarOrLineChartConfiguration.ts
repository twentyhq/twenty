import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { GRAPH_DEFAULT_DATE_GRANULARITY } from '@/page-layout/widgets/graph/constants/GraphDefaultDateGranularity';
import { GRAPH_DEFAULT_ORDER_BY } from '@/page-layout/widgets/graph/constants/GraphDefaultOrderBy';
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
import {
  type BarChartConfiguration,
  type LineChartConfiguration,
} from '~/generated/graphql';
import {
  buildGroupByFieldObject,
  type GroupByFieldObject,
} from './buildGroupByFieldObject';

export const generateGroupByQueryVariablesFromBarOrLineChartConfiguration = ({
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
  chartConfiguration: BarChartConfiguration | LineChartConfiguration;
  aggregateOperation?: string;
  limit?: number;
  firstDayOfTheWeek?: number;
  userTimeZone?: string;
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

  const isFieldXDate = isFieldMetadataDateKind(groupByFieldX.type);

  const isFieldXNestedDate = isRelationNestedFieldDateKind({
    relationField: groupByFieldX,
    relationNestedFieldName: groupBySubFieldNameX,
    objectMetadataItems,
  });

  const shouldApplyDateGranularityX = isFieldXDate || isFieldXNestedDate;

  const groupBy: Array<GroupByFieldObject> = [];

  groupBy.push(
    buildGroupByFieldObject({
      field: groupByFieldX,
      subFieldName: groupBySubFieldNameX,
      dateGranularity: shouldApplyDateGranularityX
        ? (chartConfiguration.primaryAxisDateGranularity ??
          GRAPH_DEFAULT_DATE_GRANULARITY)
        : undefined,
      firstDayOfTheWeek,
      isNestedDateField: isFieldXNestedDate,
      timeZone: userTimeZone,
    }),
  );

  if (isDefined(groupByFieldY)) {
    const isFieldYDate = isFieldMetadataDateKind(groupByFieldY.type);

    const isFieldYNestedDate = isRelationNestedFieldDateKind({
      relationField: groupByFieldY,
      relationNestedFieldName: groupBySubFieldNameY,
      objectMetadataItems,
    });

    const shouldApplyDateGranularityY = isFieldYDate || isFieldYNestedDate;

    groupBy.push(
      buildGroupByFieldObject({
        field: groupByFieldY,
        subFieldName: groupBySubFieldNameY,
        dateGranularity: shouldApplyDateGranularityY
          ? (chartConfiguration.secondaryAxisGroupByDateGranularity ??
            GRAPH_DEFAULT_DATE_GRANULARITY)
          : undefined,
        firstDayOfTheWeek,
        isNestedDateField: isFieldYNestedDate,
        timeZone: userTimeZone,
      }),
    );
  }

  const orderBy: Array<
    | AggregateOrderByWithGroupByField
    | ObjectRecordOrderByForScalarField
    | ObjectRecordOrderByWithGroupByDateField
    | ObjectRecordOrderByForCompositeField
    | ObjectRecordOrderByForRelationField
  > = [];

  const primaryAxisOrderBy = getGroupByOrderBy({
    graphOrderBy:
      chartConfiguration.primaryAxisOrderBy ?? GRAPH_DEFAULT_ORDER_BY,
    groupByField: groupByFieldX,
    groupBySubFieldName: chartConfiguration.primaryAxisGroupBySubFieldName,
    aggregateOperation,
    dateGranularity: shouldApplyDateGranularityX
      ? (chartConfiguration.primaryAxisDateGranularity ??
        GRAPH_DEFAULT_DATE_GRANULARITY)
      : undefined,
  });

  if (isDefined(primaryAxisOrderBy)) {
    orderBy.push(primaryAxisOrderBy);
  }

  if (isDefined(groupByFieldY)) {
    const isFieldYDateForOrderBy = isFieldMetadataDateKind(groupByFieldY.type);

    const isFieldYNestedDateForOrderBy = isRelationNestedFieldDateKind({
      relationField: groupByFieldY,
      relationNestedFieldName: groupBySubFieldNameY,
      objectMetadataItems,
    });

    const shouldApplyDateGranularityYForOrderBy =
      isFieldYDateForOrderBy || isFieldYNestedDateForOrderBy;

    const secondaryAxisOrderBy = getGroupByOrderBy({
      graphOrderBy:
        chartConfiguration.secondaryAxisOrderBy ?? GRAPH_DEFAULT_ORDER_BY,
      groupByField: groupByFieldY,
      groupBySubFieldName: chartConfiguration.secondaryAxisGroupBySubFieldName,
      aggregateOperation,
      dateGranularity: shouldApplyDateGranularityYForOrderBy
        ? (chartConfiguration.secondaryAxisGroupByDateGranularity ??
          GRAPH_DEFAULT_DATE_GRANULARITY)
        : undefined,
    });

    if (isDefined(secondaryAxisOrderBy)) {
      orderBy.push(secondaryAxisOrderBy);
    }
  }

  return {
    groupBy,
    orderBy,
    ...(isDefined(limit) && { limit }),
  };
};
