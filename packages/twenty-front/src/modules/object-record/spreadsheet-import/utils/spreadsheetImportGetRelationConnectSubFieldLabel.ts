import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';

export const getRelationConnectSubFieldLabel = (
  fieldMetadataItem: FieldMetadataItem,
  uniqueFieldMetadataItem: FieldMetadataItem,
  compositeSubFieldLabel?: string,
) => {
  return `${fieldMetadataItem.label} / ${uniqueFieldMetadataItem.label}${compositeSubFieldLabel ? ` / ${compositeSubFieldLabel}` : ''}`;
};
