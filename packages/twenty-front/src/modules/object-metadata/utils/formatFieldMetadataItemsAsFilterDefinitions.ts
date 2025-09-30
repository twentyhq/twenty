import { type ObjectMetadataItem } from '../types/ObjectMetadataItem';

export const getRelationObjectMetadataNameSingular = ({
  field,
}: {
  field: ObjectMetadataItem['fields'][0];
}): string | undefined => {
  return field.relation?.targetObjectMetadata.nameSingular;
};
