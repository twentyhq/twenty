import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isHiddenSystemField } from '@/object-metadata/utils/isHiddenSystemField';
import { isFieldMorphRelation } from '@/object-record/record-field/ui/types/guards/isFieldMorphRelation';
import { isFieldRelation } from '@/object-record/record-field/ui/types/guards/isFieldRelation';
import { isFieldMetadataSupportedInGroupBy } from 'twenty-shared/utils';

export const isFieldSupportedAsChartGroupBySubField = (
  field: FieldMetadataItem,
): boolean => {
  if (
    isHiddenSystemField(field) ||
    isFieldRelation(field) ||
    isFieldMorphRelation(field)
  ) {
    return false;
  }

  return isFieldMetadataSupportedInGroupBy({
    type: field.type,
    name: field.name,
    isSystem: field.isSystem ?? false,
    relationType: field.settings?.relationType ?? null,
  });
};
