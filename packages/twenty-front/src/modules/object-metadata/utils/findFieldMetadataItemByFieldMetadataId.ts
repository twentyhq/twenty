import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { doesFieldMetadataItemMatchFieldMetadataId } from '@/object-metadata/utils/doesFieldMetadataItemMatchFieldMetadataId';
import { isDefined } from 'twenty-shared/utils';

export const findFieldMetadataItemByFieldMetadataId = ({
  fieldMetadataItems,
  fieldMetadataId,
}: {
  fieldMetadataItems: FieldMetadataItem[] | undefined;
  fieldMetadataId: string | null | undefined;
}): FieldMetadataItem | undefined =>
  isDefined(fieldMetadataId)
    ? fieldMetadataItems?.find((fieldMetadataItem) =>
        doesFieldMetadataItemMatchFieldMetadataId({
          fieldMetadataItem,
          fieldMetadataId,
        }),
      )
    : undefined;
