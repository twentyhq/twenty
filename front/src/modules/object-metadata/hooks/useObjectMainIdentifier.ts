import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { MainIdentifierMapper } from '@/ui/object/field/types/MainIdentifierMapper';
import { Nullable } from '~/types/Nullable';

export const useObjectMainIdentifier = (
  objectMetadataItem?: Nullable<ObjectMetadataItem>,
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
        id: record.id,
        name: record.name,
        avatarUrl: record.avatarUrl,
        avatarType: 'squared',
        record: record,
      };
    }

    if (objectMetadataItem.nameSingular === 'workspaceMember') {
      return {
        id: record.id,
        name: record.name.firstName + ' ' + record.name.lastName,
        avatarUrl: record.avatarUrl,
        avatarType: 'rounded',
        record: record,
      };
    }

    return {
      id: record.id,
      name: record.name,
      avatarUrl: record.avatarUrl,
      avatarType: 'rounded',
      record: record,
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
