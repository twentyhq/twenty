import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { getFieldMetadataItemByIdOrThrow } from '@/object-metadata/utils/getFieldMetadataItemByIdOrThrow';

type GetFieldMetadataItemByIdParams = {
  fieldMetadataId: string;
  objectMetadataItems: EnrichedObjectMetadataItem[];
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
