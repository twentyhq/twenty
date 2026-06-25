import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';

export const getRelationObjectMetadataNameSingular = ({
  field,
}: {
  field: EnrichedObjectMetadataItem['fields'][0];
}): string | undefined => {
  return field.relation?.targetObjectMetadata.nameSingular;
};
