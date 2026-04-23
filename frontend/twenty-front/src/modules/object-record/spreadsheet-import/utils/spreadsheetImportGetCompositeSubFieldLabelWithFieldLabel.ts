import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';

export const getCompositeSubFieldLabelWithFieldLabel = (
  fieldMetadataItem: FieldMetadataItem,
  subFieldLabel: string,
) => {
  return `${fieldMetadataItem.label} / ${subFieldLabel}`;
};
