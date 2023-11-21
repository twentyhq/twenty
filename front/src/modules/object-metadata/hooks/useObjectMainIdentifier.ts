import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { AvatarType } from '@/users/components/Avatar';
import { Nullable } from '~/types/Nullable';

export const useObjectMainIdentifier = (
  objectMetadataItem?: Nullable<ObjectMetadataItem>,
) => {
  if (!objectMetadataItem) {
    return {};
  }

  const labelIdentifierFieldPaths = ['person', 'workspaceMember'].includes(
    objectMetadataItem.nameSingular,
  )
    ? ['name.firstName', 'name.lastName']
    : ['name'];
  const imageIdentifierFormat: AvatarType = ['company'].includes(
    objectMetadataItem.nameSingular,
  )
    ? 'squared'
    : 'rounded';
  const imageIdentifierUrlPrefix = ['company'].includes(
    objectMetadataItem.nameSingular,
  )
    ? 'https://favicon.twenty.com/'
    : '';
  const imageIdentifierUrlField = ['company'].includes(
    objectMetadataItem.nameSingular,
  )
    ? 'domainName'
    : 'avatarUrl';

  const mainIdentifierFieldMetadataId = objectMetadataItem.fields.find(
    ({ name }) => name === 'name',
  )?.id;

  const basePathToShowPage = `/object/${objectMetadataItem.nameSingular}/`;

  return {
    labelIdentifierFieldPaths,
    imageIdentifierUrlField,
    imageIdentifierUrlPrefix,
    imageIdentifierFormat,
    mainIdentifierFieldMetadataId,
    basePathToShowPage,
  };
};
