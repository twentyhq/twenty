import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';

export const doesFieldMetadataItemMatchFieldMetadataId = ({
  fieldMetadataItem,
  fieldMetadataId,
}: {
  fieldMetadataItem: FieldMetadataItem;
  fieldMetadataId: string;
}): boolean =>
  fieldMetadataItem.id === fieldMetadataId ||
  (fieldMetadataItem.morphRelations ?? []).some(
    ({ sourceFieldMetadata }) => sourceFieldMetadata.id === fieldMetadataId,
  );
