import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';

export const isImageIdentifierField = ({
  fieldMetadataItem,
  objectMetadataItem,
  isFilesFieldMigrated,
}: {
  fieldMetadataItem: Pick<FieldMetadataItem, 'id' | 'name'>;
  objectMetadataItem: Pick<
    ObjectMetadataItem,
    'imageIdentifierFieldMetadataId' | 'nameSingular'
  >;
  isFilesFieldMigrated?: boolean;
}) => {
  if (
    objectMetadataItem.nameSingular === CoreObjectNameSingular.Company &&
    fieldMetadataItem.name === 'domainName'
  ) {
    return true;
  }

  if (objectMetadataItem.nameSingular === CoreObjectNameSingular.Person) {
    if (isFilesFieldMigrated === true) {
      return fieldMetadataItem.name === 'avatarFile';
    }
    return fieldMetadataItem.name === 'avatarUrl';
  }

  return (
    fieldMetadataItem.id === objectMetadataItem.imageIdentifierFieldMetadataId
  );
};
