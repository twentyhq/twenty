import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { GRAPH_DEFAULT_DATE_GRANULARITY } from '@/page-layout/widgets/graph/constants/GraphDefaultDateGranularity.constant';
import { getGroupByOrderBy } from '@/page-layout/widgets/graph/utils/getGroupByOrderBy';
import { isNestedFieldDateType } from '@/page-layout/widgets/graph/utils/isNestedFieldDateType';
import {
  type AggregateOrderByWithGroupByField,
  type ObjectRecordOrderByForCompositeField,
  type ObjectRecordOrderByForRelationField,
  type ObjectRecordOrderByForScalarField,
  type ObjectRecordOrderByWithGroupByDateField,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type PieChartConfiguration } from '~/generated/graphql';
import { FieldMetadataType } from '~/generated-metadata/graphql';
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
}: {
  objectMetadataItem: ObjectMetadataItem;
  objectMetadataItems: ObjectMetadataItem[];
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

  const isFieldDate =
    groupByField.type === FieldMetadataType.DATE ||
    groupByField.type === FieldMetadataType.DATE_TIME;

  const isNestedDate = isNestedFieldDateType(
    groupByField,
    groupBySubFieldName,
    objectMetadataItems,
  );

  const shouldApplyDateGranularity = isFieldDate || isNestedDate;

  const groupBy: Array<GroupByFieldObject> = [
    buildGroupByFieldObject({
      field: groupByField,
      subFieldName: groupBySubFieldName,
      dateGranularity: shouldApplyDateGranularity
        ? (dateGranularity ?? GRAPH_DEFAULT_DATE_GRANULARITY)
        : undefined,
      isNestedDateField: isNestedDate,
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
    orderBy.push(
      getGroupByOrderBy({
        graphOrderBy: chartConfiguration.orderBy,
        groupByField,
        groupBySubFieldName,
        aggregateOperation,
        dateGranularity: shouldApplyDateGranularity
          ? (dateGranularity ?? GRAPH_DEFAULT_DATE_GRANULARITY)
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
