import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';

export const doesFieldMetadataItemMatchFieldMetadataId = ({
  fieldMetadataItem,
  fieldMetadataId,
}: {
  fieldMetadataItem: Pick<
    FieldMetadataItem,
    'id' | 'relation' | 'morphRelations'
  >;
  fieldMetadataId: string;
}): boolean =>
  fieldMetadataItem.id === fieldMetadataId ||
  fieldMetadataItem.relation?.sourceFieldMetadata.id === fieldMetadataId ||
  (fieldMetadataItem.morphRelations ?? []).some(
    ({ sourceFieldMetadata }) => sourceFieldMetadata.id === fieldMetadataId,
  );
