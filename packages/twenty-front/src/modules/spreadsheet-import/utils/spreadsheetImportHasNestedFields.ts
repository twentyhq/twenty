import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isCompositeFieldType } from '@/object-record/object-filter-dropdown/utils/isCompositeFieldType';
import { FieldMetadataType } from 'twenty-shared/types';
import { RelationType } from '~/generated/graphql';

export const hasNestedFields = (fieldMetadata: FieldMetadataItem) => {
  return (
    (fieldMetadata.type === FieldMetadataType.RELATION &&
      fieldMetadata.relation?.type === RelationType.MANY_TO_ONE) ||
    isCompositeFieldType(fieldMetadata.type)
  );
};
