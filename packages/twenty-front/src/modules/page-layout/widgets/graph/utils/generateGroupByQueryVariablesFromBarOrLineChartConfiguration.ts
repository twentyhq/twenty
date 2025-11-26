import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { isFieldRelation } from '@/object-record/record-field/ui/types/guards/isFieldRelation';
import { getGroupByOrderBy } from '@/page-layout/widgets/graph/utils/getGroupByOrderBy';
import {
  type AggregateOrderByWithGroupByField,
  type ObjectRecordOrderByForCompositeField,
  type ObjectRecordOrderByForRelationField,
  type ObjectRecordOrderByForScalarField,
  type ObjectRecordOrderByWithGroupByDateField,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import {
  type BarChartConfiguration,
  type LineChartConfiguration,
} from '~/generated/graphql';
import {
  buildGroupByFieldObject,
  type GroupByFieldObject,
} from './buildGroupByFieldObject';

const isNestedFieldDateType = (
  field: FieldMetadataItem,
  subFieldName: string | undefined,
  objectMetadataItems: ObjectMetadataItem[],
): boolean => {
  if (!isDefined(subFieldName)) {
    return false;
  }

  if (!isFieldRelation(field)) {
    return false;
  }

  const targetObjectNameSingular =
    field.relation?.targetObjectMetadata?.nameSingular;

  if (!isDefined(targetObjectNameSingular)) {
    return false;
  }

  const targetObjectMetadataItem = objectMetadataItems.find(
    (item) => item.nameSingular === targetObjectNameSingular,
  );

  if (!isDefined(targetObjectMetadataItem)) {
    return false;
  }

  const nestedFieldName = subFieldName.split('.')[0];
  const nestedField = targetObjectMetadataItem.fields.find(
    (f) => f.name === nestedFieldName,
  );

  if (!isDefined(nestedField)) {
    return false;
  }

  return (
    nestedField.type === FieldMetadataType.DATE ||
    nestedField.type === FieldMetadataType.DATE_TIME
  );
};

export const generateGroupByQueryVariablesFromBarOrLineChartConfiguration = ({
  objectMetadataItem,
  objectMetadataItems,
  chartConfiguration,
  aggregateOperation,
  limit,
}: {
  objectMetadataItem: ObjectMetadataItem;
  objectMetadataItems: ObjectMetadataItem[];
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

  const isFieldXDate =
    groupByFieldX.type === FieldMetadataType.DATE ||
    groupByFieldX.type === FieldMetadataType.DATE_TIME;

  const isFieldXNestedDate = isNestedFieldDateType(
    groupByFieldX,
    groupBySubFieldNameX,
    objectMetadataItems,
  );

  const shouldApplyDateGranularityX = isFieldXDate || isFieldXNestedDate;

  const groupBy: Array<GroupByFieldObject> = [];

  groupBy.push(
    buildGroupByFieldObject({
      field: groupByFieldX,
      subFieldName: groupBySubFieldNameX,
      dateGranularity: shouldApplyDateGranularityX
        ? (chartConfiguration.primaryAxisDateGranularity ?? undefined)
        : undefined,
    }),
  );

  if (isDefined(groupByFieldY)) {
    const isFieldYDate =
      groupByFieldY.type === FieldMetadataType.DATE ||
      groupByFieldY.type === FieldMetadataType.DATE_TIME;

    const isFieldYNestedDate = isNestedFieldDateType(
      groupByFieldY,
      groupBySubFieldNameY,
      objectMetadataItems,
    );

    const shouldApplyDateGranularityY = isFieldYDate || isFieldYNestedDate;

    groupBy.push(
      buildGroupByFieldObject({
        field: groupByFieldY,
        subFieldName: groupBySubFieldNameY,
        dateGranularity: shouldApplyDateGranularityY
          ? (chartConfiguration.secondaryAxisGroupByDateGranularity ??
            undefined)
          : undefined,
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
        dateGranularity:
          chartConfiguration.primaryAxisDateGranularity ?? undefined,
        objectMetadataItems,
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
        objectMetadataItems,
      }),
    );
  }

  return {
    groupBy,
    ...(orderBy.length > 0 && { orderBy }),
    ...(isDefined(limit) && { limit }),
  };
};
