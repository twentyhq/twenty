import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { getTraversedFieldLabel } from '@/object-record/record-field/utils/getTraversedFieldLabel';
import { getTraversableTargetFieldMetadataItems } from '@/object-record/record-field/utils/relation-traversal/getTraversableTargetFieldMetadataItems';

export type TraversedFieldCandidate = {
  relationFieldMetadataItem: FieldMetadataItem;
  targetFieldMetadataItem: FieldMetadataItem;
  recordField: Pick<
    RecordField,
    'fieldMetadataItemId' | 'relationTargetFieldMetadataItemId'
  >;
  label: string;
};

export const getTraversedFieldCandidates = ({
  relationFieldMetadataItem,
  targetObjectMetadataItem,
}: {
  relationFieldMetadataItem: FieldMetadataItem;
  targetObjectMetadataItem: EnrichedObjectMetadataItem;
}): TraversedFieldCandidate[] =>
  getTraversableTargetFieldMetadataItems(targetObjectMetadataItem).map(
    (targetFieldMetadataItem) => ({
      relationFieldMetadataItem,
      targetFieldMetadataItem,
      recordField: {
        fieldMetadataItemId: relationFieldMetadataItem.id,
        relationTargetFieldMetadataItemId: targetFieldMetadataItem.id,
      },
      label: getTraversedFieldLabel({
        relationFieldLabel: relationFieldMetadataItem.label,
        targetFieldLabel: targetFieldMetadataItem.label,
      }),
    }),
  );
