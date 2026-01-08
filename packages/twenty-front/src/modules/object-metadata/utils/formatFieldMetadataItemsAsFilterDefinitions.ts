import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';

export const getRelationObjectMetadataNameSingular = ({
  field,
}: {
  field: ObjectMetadataItem['fields'][0];
}): string | undefined => {
  return field.relation?.targetObjectMetadata.nameSingular;
};
