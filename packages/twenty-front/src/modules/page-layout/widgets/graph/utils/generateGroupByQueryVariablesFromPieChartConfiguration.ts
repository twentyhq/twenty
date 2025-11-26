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
import { type PieChartConfiguration } from '~/generated/graphql';
import { FieldMetadataType } from '~/generated-metadata/graphql';
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
      dateGranularity: shouldApplyDateGranularity ? dateGranularity : undefined,
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
        dateGranularity,
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
