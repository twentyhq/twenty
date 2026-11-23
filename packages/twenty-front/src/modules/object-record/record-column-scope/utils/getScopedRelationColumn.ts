import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { getRelationLookupTarget } from '@/object-record/record-column-lookup/utils/getRelationLookupTarget';
import { type ScopedRelationAlias } from '@/object-record/record-column-scope/types/ScopedRelationAlias';
import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { isCanonicalRecordField } from '@/object-record/record-field/utils/isCanonicalRecordField';
import { isPlainOneToManyRelationField } from '@/object-record/utils/isPlainOneToManyRelationField';
import { findRelationTargetObjectMetadataItem } from '@/related-record-paths/utils/findRelationTargetObjectMetadataItem';
import { isDefined } from 'twenty-shared/utils';

export const getScopedRelationColumn = ({
  recordField,
  fieldMetadataItem,
  objectMetadataItems,
  isLookupColumnsEnabled,
}: {
  recordField: Pick<
    RecordField,
    'isCanonical' | 'relationScope' | 'relationTargetFieldMetadataId'
  >;
  fieldMetadataItem: FieldMetadataItem;
  objectMetadataItems: EnrichedObjectMetadataItem[];
  isLookupColumnsEnabled: boolean;
}):
  | Pick<ScopedRelationAlias, 'relationObjectMetadataItem' | 'lookupTarget'>
  | undefined => {
  if (
    !isLookupColumnsEnabled ||
    isCanonicalRecordField(recordField) ||
    !isDefined(recordField.relationScope) ||
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

  if (!isDefined(recordField.relationTargetFieldMetadataId)) {
    return { relationObjectMetadataItem };
  }

  return {
    relationObjectMetadataItem,
    lookupTarget: getRelationLookupTarget({
      relationFieldMetadataItem: fieldMetadataItem,
      relationTargetFieldMetadataId: recordField.relationTargetFieldMetadataId,
      objectMetadataItems,
    }),
  };
};
