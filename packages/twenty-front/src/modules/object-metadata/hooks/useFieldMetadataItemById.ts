import { CustomError } from '@/error-handler/CustomError';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

const FIELD_METADATA_ITEM_NOT_FOUND_ERROR_CODE =
  'FIELD_METADATA_ITEM_NOT_FOUND';

export const useFieldMetadataItemById = (fieldMetadataId: string) => {
  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);

  const fieldMetadataItem = objectMetadataItems
    .flatMap((objectMetadataItem) => objectMetadataItem.fields)
    .find((field) => field.id === fieldMetadataId);

  if (!isDefined(fieldMetadataItem)) {
    throw new CustomError(
      `Field metadata item not found for id ${fieldMetadataId}`,
      FIELD_METADATA_ITEM_NOT_FOUND_ERROR_CODE,
    );
  }

  return { fieldMetadataItem };
};
