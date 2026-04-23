import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isCompositeFieldType } from '@/object-record/object-filter-dropdown/utils/isCompositeFieldType';
import { COMPOSITE_FIELD_SUB_FIELD_LABELS } from '@/settings/data-model/constants/CompositeFieldSubFieldLabel';

export const getCompositeSubFieldKey = (
  fieldMetadataItem: FieldMetadataItem,
  subFieldName: string,
) => {
  if (!isCompositeFieldType(fieldMetadataItem.type)) {
    throw new Error(
      `getCompositeSubFieldKey can only be called for composite field types. Received: ${fieldMetadataItem.type}`,
    );
  }

  const subFieldLabel =
    COMPOSITE_FIELD_SUB_FIELD_LABELS[fieldMetadataItem.type][subFieldName];

  return `${subFieldLabel} (${fieldMetadataItem.name})`;
};
