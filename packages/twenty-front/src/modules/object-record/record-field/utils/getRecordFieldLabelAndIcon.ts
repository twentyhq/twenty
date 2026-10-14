import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { getTraversedFieldLabel } from '@/object-record/record-field/utils/getTraversedFieldLabel';
import { resolveRecordFieldRelationTraversal } from '@/object-record/record-field/utils/relation-traversal/resolveRecordFieldRelationTraversal';
import { isDefined } from 'twenty-shared/utils';

export type RecordFieldLabelAndIcon = {
  label: string;
  icon: string | null | undefined;
  applicationId: string | null | undefined;
};

export const getRecordFieldLabelAndIcon = ({
  recordField,
  objectMetadataItem,
  objectMetadataItems,
}: {
  recordField: Pick<
    RecordField,
    'fieldMetadataItemId' | 'relationTargetFieldMetadataItemId'
  >;
  objectMetadataItem: EnrichedObjectMetadataItem;
  objectMetadataItems: EnrichedObjectMetadataItem[];
}): RecordFieldLabelAndIcon | null => {
  if (isDefined(recordField.relationTargetFieldMetadataItemId)) {
    const relationTraversal = resolveRecordFieldRelationTraversal({
      recordField,
      sourceObjectMetadataItem: objectMetadataItem,
      objectMetadataItems,
    });

    if (!isDefined(relationTraversal)) {
      return null;
    }

    return {
      label: getTraversedFieldLabel({
        relationFieldLabel: relationTraversal.relationFieldMetadataItem.label,
        targetFieldLabel: relationTraversal.targetFieldMetadataItem.label,
      }),
      icon: relationTraversal.targetFieldMetadataItem.icon,
      applicationId: relationTraversal.targetFieldMetadataItem.applicationId,
    };
  }

  const fieldMetadataItem = objectMetadataItem.fields.find(
    (fieldMetadataItemToFind) =>
      fieldMetadataItemToFind.id === recordField.fieldMetadataItemId,
  );

  if (!isDefined(fieldMetadataItem)) {
    return null;
  }

  return {
    label: fieldMetadataItem.label,
    icon: fieldMetadataItem.icon,
    applicationId: fieldMetadataItem.applicationId,
  };
};
