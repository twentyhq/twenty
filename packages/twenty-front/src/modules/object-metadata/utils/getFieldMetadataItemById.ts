import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getFieldMetadataItemByIdOrThrow } from '@/object-metadata/utils/getFieldMetadataItemByIdOrThrow';

type GetFieldMetadataItemByIdParams = {
  fieldMetadataId: string;
  objectMetadataItems: ObjectMetadataItem[];
};

export const getFieldMetadataItemById = ({
  fieldMetadataId,
  objectMetadataItems,
}: GetFieldMetadataItemByIdParams) => {
  try {
    return getFieldMetadataItemByIdOrThrow({
      fieldMetadataId,
      objectMetadataItems,
    });
  } catch {
    return {
      fieldMetadataItem: undefined,
      objectMetadataItem: undefined,
    };
  }
};
