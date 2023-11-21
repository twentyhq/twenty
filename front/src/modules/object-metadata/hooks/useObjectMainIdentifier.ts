import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { Nullable } from '~/types/Nullable';

export const useObjectMainIdentifier = (
  objectMetadataItem?: Nullable<ObjectMetadataItem>,
) => {
  if (!objectMetadataItem) {
    return {};
  }

  const labelIdentifierFieldMetadataId = objectMetadataItem.fields.find(
    ({ name }) => name === 'name',
  )?.id;

  const basePathToShowPage = `/object/${objectMetadataItem.nameSingular}/`;

  return {
    labelIdentifierFieldMetadataId,
    basePathToShowPage,
  };
};
