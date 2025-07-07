import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getFilterFilterableFieldMetadataItems } from '@/object-metadata/utils/getFilterFilterableFieldMetadataItems';
import { SEARCH_VECTOR_FIELD_NAME } from '../constants/ViewFieldConstants';

export const getFilterableFieldsWithVectorSearch = (
  objectMetadataItem: ObjectMetadataItem,
) => {
  const vectorSearchField = objectMetadataItem.fields.find(
    (field) =>
      field.type === 'TS_VECTOR' && field.name === SEARCH_VECTOR_FIELD_NAME,
  );

  return [
    ...objectMetadataItem.fields.filter(
      getFilterFilterableFieldMetadataItems({ isJsonFilterEnabled: true }),
    ),
    ...(vectorSearchField ? [vectorSearchField] : []),
  ];
};
