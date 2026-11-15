import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { getAggregatedFieldMetadataItems } from '@/object-record/record-column-aggregate/utils/getAggregatedFieldMetadataItems';
import { RELATION_AGGREGATE_OPERATIONS_BY_FIELD_TYPE } from '@/object-record/record-column-aggregate/constants/RelationAggregateOperationsByFieldType';
import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { AggregateOperations } from '@/object-record/record-table/constants/AggregateOperations';
import { type ExtendedAggregateOperations } from '@/object-record/record-table/types/ExtendedAggregateOperations';
import { convertAggregateOperationToExtendedAggregateOperation } from '@/object-record/utils/convertAggregateOperationToExtendedAggregateOperation';
import { getAvailableAggregationsFromObjectFields } from '@/object-record/utils/getAvailableAggregationsFromObjectFields';
import { isPlainOneToManyRelationField } from '@/object-record/utils/isPlainOneToManyRelationField';
import { findRelationTargetObjectMetadataItem } from '@/related-record-paths/utils/findRelationTargetObjectMetadataItem';
import { FIELD_FOR_TOTAL_COUNT_AGGREGATE_OPERATION } from 'twenty-shared/constants';
import { findById, isDefined } from 'twenty-shared/utils';

export type RecordFieldAggregateTarget = {
  relationFieldName: string;
  relationObjectMetadataItem: EnrichedObjectMetadataItem;
  aggregateOperation: ExtendedAggregateOperations;
  aggregatedFieldMetadataItem: FieldMetadataItem | undefined;
  aggregateGqlFieldName: string;
};

export const getRecordFieldAggregateTarget = ({
  recordField,
  fieldMetadataItem,
  objectMetadataItems,
}: {
  recordField: Pick<
    RecordField,
    'relationTargetFieldMetadataId' | 'relationAggregateOperation'
  >;
  fieldMetadataItem: FieldMetadataItem;
  objectMetadataItems: EnrichedObjectMetadataItem[];
}): RecordFieldAggregateTarget | undefined => {
  const { relationAggregateOperation, relationTargetFieldMetadataId } =
    recordField;

  if (
    !isDefined(relationAggregateOperation) ||
    !isPlainOneToManyRelationField(fieldMetadataItem)
  ) {
    return undefined;
  }

  const relationObjectMetadataItem = findRelationTargetObjectMetadataItem({
    fieldMetadataItem,
    objectMetadataItems,
  });

  if (!isDefined(relationObjectMetadataItem)) {
    return undefined;
  }

  const isCount = relationAggregateOperation === AggregateOperations.COUNT;

  const aggregatedFieldMetadataItem = isDefined(relationTargetFieldMetadataId)
    ? getAggregatedFieldMetadataItems(relationObjectMetadataItem).find(
        findById(relationTargetFieldMetadataId),
      )
    : undefined;

  const isValidTarget = isCount
    ? !isDefined(relationTargetFieldMetadataId)
    : isDefined(aggregatedFieldMetadataItem) &&
      RELATION_AGGREGATE_OPERATIONS_BY_FIELD_TYPE[
        aggregatedFieldMetadataItem.type
      ]?.includes(relationAggregateOperation) === true;

  if (!isValidTarget) {
    return undefined;
  }

  const aggregateOperation =
    convertAggregateOperationToExtendedAggregateOperation(
      relationAggregateOperation,
      aggregatedFieldMetadataItem?.type,
    );

  const aggregateGqlFieldName = getAvailableAggregationsFromObjectFields(
    isDefined(aggregatedFieldMetadataItem) ? [aggregatedFieldMetadataItem] : [],
  )[
    aggregatedFieldMetadataItem?.name ??
      FIELD_FOR_TOTAL_COUNT_AGGREGATE_OPERATION
  ]?.[aggregateOperation];

  if (!isDefined(aggregateGqlFieldName)) {
    return undefined;
  }

  return {
    relationFieldName: fieldMetadataItem.name,
    relationObjectMetadataItem,
    aggregateOperation,
    aggregatedFieldMetadataItem,
    aggregateGqlFieldName,
  };
};
