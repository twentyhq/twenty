import { MainIdentifierMapper } from '@/object-metadata/types/MainIdentifierMapper';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';

export const useObjectMainIdentifier = (
  objectMetadataItem?: ObjectMetadataItem,
) => {
  if (!objectMetadataItem) {
    return {
      mainIdentifierMapper: undefined,
      mainIdentifierFieldMetadataId: undefined,
      basePathToShowPage: undefined,
    };
  }

  const mainIdentifierMapper: MainIdentifierMapper = (record: any) => {
    if (objectMetadataItem.nameSingular === 'company') {
      return {
        name: record.name,
        pictureUrl: record.pictureUrl,
        avatarType: 'squared',
      };
    }

    if (objectMetadataItem.nameSingular === 'workspaceMember') {
      return {
        name: record.name.firstName + ' ' + record.name.lastName,
        pictureUrl: record.avatarUrl,
        avatarType: 'rounded',
      };
    }

    return {
      name: record.name,
      pictureUrl: record.pictureUrl,
      avatarType: 'rounded',
    };
  };

  const mainIdentifierFieldMetadataId = objectMetadataItem.fields.find(
    ({ name }) => name === 'name',
  )?.id;

  const basePathToShowPage = `/object/${objectMetadataItem.nameSingular}/`;

  return {
    mainIdentifierMapper,
    mainIdentifierFieldMetadataId,
    basePathToShowPage,
  };
};
