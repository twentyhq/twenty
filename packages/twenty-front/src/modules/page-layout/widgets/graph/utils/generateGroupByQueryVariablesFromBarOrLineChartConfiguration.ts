import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { GRAPH_DEFAULT_DATE_GRANULARITY } from '@/page-layout/widgets/graph/constants/GraphDefaultDateGranularity.constant';
import { getGroupByOrderBy } from '@/page-layout/widgets/graph/utils/getGroupByOrderBy';
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
  chartConfiguration,
  aggregateOperation,
  limit,
  firstDayOfTheWeek,
}: {
  objectMetadataItem: ObjectMetadataItem;
  chartConfiguration: BarChartConfiguration | LineChartConfiguration;
  aggregateOperation?: string;
  limit?: number;
  firstDayOfTheWeek?: number;
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

  const groupBy: Array<GroupByFieldObject> = [];

  groupBy.push(
    buildGroupByFieldObject({
      field: groupByFieldX,
      subFieldName: groupBySubFieldNameX,
      dateGranularity: isFieldXDate
        ? (chartConfiguration.primaryAxisDateGranularity ??
          GRAPH_DEFAULT_DATE_GRANULARITY)
        : undefined,

      firstDayOfTheWeek,
    }),
  );

  if (isDefined(groupByFieldY)) {
    const isFieldYDate = isFieldMetadataDateKind(groupByFieldY.type);

    groupBy.push(
      buildGroupByFieldObject({
        field: groupByFieldY,
        subFieldName: groupBySubFieldNameY,
        dateGranularity: isFieldYDate
          ? (chartConfiguration.secondaryAxisGroupByDateGranularity ??
            GRAPH_DEFAULT_DATE_GRANULARITY)
          : undefined,
        firstDayOfTheWeek,
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

  if (isDefined(chartConfiguration.primaryAxisOrderBy)) {
    orderBy.push(
      getGroupByOrderBy({
        graphOrderBy: chartConfiguration.primaryAxisOrderBy,
        groupByField: groupByFieldX,
        groupBySubFieldName: chartConfiguration.primaryAxisGroupBySubFieldName,
        aggregateOperation,
        dateGranularity: isFieldXDate
          ? (chartConfiguration.primaryAxisDateGranularity ??
            GRAPH_DEFAULT_DATE_GRANULARITY)
          : undefined,
      }),
    );
  }
  if (
    isDefined(groupByFieldY) &&
    isDefined(chartConfiguration.secondaryAxisOrderBy)
  ) {
    const isFieldYDateForOrderBy = isFieldMetadataDateKind(groupByFieldY.type);

    orderBy.push(
      getGroupByOrderBy({
        graphOrderBy: chartConfiguration.secondaryAxisOrderBy,
        groupByField: groupByFieldY,
        groupBySubFieldName:
          chartConfiguration.secondaryAxisGroupBySubFieldName,
        aggregateOperation,
        dateGranularity: isFieldYDateForOrderBy
          ? (chartConfiguration.secondaryAxisGroupByDateGranularity ??
            GRAPH_DEFAULT_DATE_GRANULARITY)
          : undefined,
      }),
    );
  }

  return {
    groupBy,
    ...(orderBy.length > 0 && { orderBy }),
    ...(isDefined(limit) && { limit }),
  };
};
