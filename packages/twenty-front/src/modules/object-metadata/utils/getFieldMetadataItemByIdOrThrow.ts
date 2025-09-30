import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { CustomError, isDefined } from 'twenty-shared/utils';

type GetFieldMetadataItemByIdParams = {
  fieldMetadataId: string;
  objectMetadataItems: ObjectMetadataItem[];
};

const FIELD_METADATA_ITEM_NOT_FOUND_ERROR_CODE =
  'FIELD_METADATA_ITEM_NOT_FOUND';

export const getFieldMetadataItemByIdOrThrow = ({
  fieldMetadataId,
  objectMetadataItems,
}: GetFieldMetadataItemByIdParams) => {
  const objectMetadataItem = objectMetadataItems.find((objectMetadataItem) =>
    objectMetadataItem.fields.some((field) => field.id === fieldMetadataId),
  );

  if (!isDefined(objectMetadataItem)) {
    throw new CustomError(
      `Object metadata item not found for field id ${fieldMetadataId}`,
      FIELD_METADATA_ITEM_NOT_FOUND_ERROR_CODE,
    );
  }

  const fieldMetadataItem = objectMetadataItem.fields.find(
    (field) => field.id === fieldMetadataId,
  );

  if (!isDefined(fieldMetadataItem)) {
    throw new CustomError(
      `Field metadata item not found for field id ${fieldMetadataId}`,
      FIELD_METADATA_ITEM_NOT_FOUND_ERROR_CODE,
    );
  }

  return {
    fieldMetadataItem,
    objectMetadataItem,
  };
};
