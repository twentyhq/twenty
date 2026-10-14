import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { isTraversableRelationFieldMetadataItem } from '@/object-record/record-field/utils/relation-traversal/isTraversableRelationFieldMetadataItem';
import { isDefined } from 'twenty-shared/utils';

export type ResolvedRecordFieldRelationTraversal = {
  relationFieldMetadataItem: FieldMetadataItem;
  targetFieldMetadataItem: FieldMetadataItem;
  targetObjectMetadataItem: EnrichedObjectMetadataItem;
};

export const resolveRecordFieldRelationTraversal = ({
  recordField,
  sourceObjectMetadataItem,
  objectMetadataItems,
}: {
  recordField: Pick<
    RecordField,
    'fieldMetadataItemId' | 'relationTargetFieldMetadataItemId'
  >;
  sourceObjectMetadataItem: EnrichedObjectMetadataItem;
  objectMetadataItems: EnrichedObjectMetadataItem[];
}): ResolvedRecordFieldRelationTraversal | null => {
  if (!isDefined(recordField.relationTargetFieldMetadataItemId)) {
    return null;
  }

  const relationFieldMetadataItem = sourceObjectMetadataItem.fields.find(
    (fieldMetadataItem) =>
      fieldMetadataItem.id === recordField.fieldMetadataItemId,
  );

  if (
    !isDefined(relationFieldMetadataItem) ||
    !isTraversableRelationFieldMetadataItem(relationFieldMetadataItem)
  ) {
    return null;
  }

  const targetObjectMetadataItem = objectMetadataItems.find(
    (objectMetadataItem) =>
      objectMetadataItem.id ===
      relationFieldMetadataItem.relation.targetObjectMetadata.id,
  );

  const targetFieldMetadataItem = targetObjectMetadataItem?.fields.find(
    (fieldMetadataItem) =>
      fieldMetadataItem.id === recordField.relationTargetFieldMetadataItemId,
  );

  if (
    !isDefined(targetObjectMetadataItem) ||
    !isDefined(targetFieldMetadataItem)
  ) {
    return null;
  }

  return {
    relationFieldMetadataItem,
    targetFieldMetadataItem,
    targetObjectMetadataItem,
  };
};
