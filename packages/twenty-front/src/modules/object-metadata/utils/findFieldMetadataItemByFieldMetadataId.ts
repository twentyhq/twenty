import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { doesFieldMetadataItemMatchFieldMetadataId } from '@/object-metadata/utils/doesFieldMetadataItemMatchFieldMetadataId';

export const findFieldMetadataItemByFieldMetadataId = ({
  fieldMetadataItems,
  fieldMetadataId,
}: {
  fieldMetadataItems: FieldMetadataItem[] | undefined;
  fieldMetadataId: string;
}): FieldMetadataItem | undefined =>
  fieldMetadataItems?.find((fieldMetadataItem) =>
    doesFieldMetadataItemMatchFieldMetadataId({
      fieldMetadataItem,
      fieldMetadataId,
    }),
  );
