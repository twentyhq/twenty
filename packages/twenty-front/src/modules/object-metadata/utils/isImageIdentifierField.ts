import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';

export const isImageIdentifierField = ({
  fieldMetadataItem,
  objectMetadataItem,
}: {
  fieldMetadataItem: Pick<FieldMetadataItem, 'id' | 'name'>;
  objectMetadataItem: Pick<
    ObjectMetadataItem,
    'imageIdentifierFieldMetadataId' | 'nameSingular'
  >;
}) => {
  if (
    objectMetadataItem.nameSingular === CoreObjectNameSingular.Company &&
    fieldMetadataItem.name === 'domainName'
  ) {
    return true;
  }

  return (
    fieldMetadataItem.id === objectMetadataItem.imageIdentifierFieldMetadataId
  );
};
