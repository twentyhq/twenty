import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { AggregateOperations } from '@/object-record/record-table/constants/AggregateOperations';
import { NON_STANDARD_AGGREGATE_OPERATION_OPTIONS } from '@/object-record/record-table/record-table-footer/constants/NonStandardAggregateOperationsOptions';
import { type ExtendedAggregateOperations } from '@/object-record/record-table/types/ExtendedAggregateOperations';
import { convertAggregateOperationToExtendedAggregateOperation } from '@/object-record/utils/convertAggregateOperationToExtendedAggregateOperation';
import { getAvailableAggregationsFromObjectFields } from '@/object-record/utils/getAvailableAggregationsFromObjectFields';
import { isPlainOneToManyRelationField } from '@/object-record/utils/isPlainOneToManyRelationField';
import { findRelationTargetObjectMetadataItem } from '@/related-record-paths/utils/findRelationTargetObjectMetadataItem';
import { findById, isDefined } from 'twenty-shared/utils';

export type RecordFieldAggregateTarget = {
  relationFieldName: string;
  aggregateOperation: ExtendedAggregateOperations;
  aggregatedFieldMetadataItem: FieldMetadataItem | undefined;
  isAggregatedFieldReadable: boolean;
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

  if (
    relationAggregateOperation === AggregateOperations.COUNT &&
    !isDefined(relationTargetFieldMetadataId)
  ) {
    return {
      relationFieldName: fieldMetadataItem.name,
      aggregateOperation: AggregateOperations.COUNT,
      aggregatedFieldMetadataItem: undefined,
      isAggregatedFieldReadable: true,
      aggregateGqlFieldName: 'totalCount',
    };
  }

  // Resolved from all fields so an unreadable target stays an aggregate column, shown as forbidden
  const aggregatedFieldMetadataItem = isDefined(relationTargetFieldMetadataId)
    ? relationObjectMetadataItem.fields.find(
        findById(relationTargetFieldMetadataId),
      )
    : undefined;

  if (
    !isDefined(aggregatedFieldMetadataItem) ||
    !NON_STANDARD_AGGREGATE_OPERATION_OPTIONS.includes(
      relationAggregateOperation,
    )
  ) {
    return undefined;
  }

  const aggregateOperation =
    convertAggregateOperationToExtendedAggregateOperation(
      relationAggregateOperation,
      aggregatedFieldMetadataItem.type,
    );

  const aggregateGqlFieldName = getAvailableAggregationsFromObjectFields([
    aggregatedFieldMetadataItem,
  ])[aggregatedFieldMetadataItem.name]?.[aggregateOperation];

  if (!isDefined(aggregateGqlFieldName)) {
    return undefined;
  }

  return {
    relationFieldName: fieldMetadataItem.name,
    aggregateOperation,
    aggregatedFieldMetadataItem,
    isAggregatedFieldReadable: relationObjectMetadataItem.readableFields.some(
      findById(aggregatedFieldMetadataItem.id),
    ),
    aggregateGqlFieldName,
  };
};
