import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isManyToOneRelationField } from '@/object-metadata/utils/isManyToOneRelationField';
import { isCompositeFieldType } from '@/object-record/object-filter-dropdown/utils/isCompositeFieldType';

export const hasNestedFields = (fieldMetadata: FieldMetadataItem) => {
  return (
    isManyToOneRelationField(fieldMetadata) ||
    isCompositeFieldType(fieldMetadata.type)
  );
};
