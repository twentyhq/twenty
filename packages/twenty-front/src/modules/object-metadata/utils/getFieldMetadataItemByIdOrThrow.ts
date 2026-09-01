import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { findFieldMetadataItemByFieldMetadataId } from '@/object-metadata/utils/findFieldMetadataItemByFieldMetadataId';
import { CustomError, isDefined } from 'twenty-shared/utils';

type GetFieldMetadataItemByIdParams = {
  fieldMetadataId: string;
  objectMetadataItems: EnrichedObjectMetadataItem[];
};

const FIELD_METADATA_ITEM_NOT_FOUND_ERROR_CODE =
  'FIELD_METADATA_ITEM_NOT_FOUND';

export const getFieldMetadataItemByIdOrThrow = ({
  fieldMetadataId,
  objectMetadataItems,
}: GetFieldMetadataItemByIdParams) => {
  for (const objectMetadataItem of objectMetadataItems) {
    const fieldMetadataItem = findFieldMetadataItemByFieldMetadataId({
      fieldMetadataItems: objectMetadataItem.fields,
      fieldMetadataId,
    });

    if (isDefined(fieldMetadataItem)) {
      return {
        fieldMetadataItem,
        objectMetadataItem,
      };
    }
  }

  throw new CustomError(
    `Object metadata item not found for field id ${fieldMetadataId}`,
    FIELD_METADATA_ITEM_NOT_FOUND_ERROR_CODE,
  );
};
