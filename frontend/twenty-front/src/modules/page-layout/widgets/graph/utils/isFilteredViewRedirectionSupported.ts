import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isFieldMorphRelation } from '@/object-record/record-field/ui/types/guards/isFieldMorphRelation';
import { isFieldRelation } from '@/object-record/record-field/ui/types/guards/isFieldRelation';
import { isDefined } from 'twenty-shared/utils';

export const isFilteredViewRedirectionSupported = (
  field: FieldMetadataItem | undefined,
): boolean => {
  if (!isDefined(field)) {
    return false;
  }

  return !isFieldRelation(field) && !isFieldMorphRelation(field);
};
