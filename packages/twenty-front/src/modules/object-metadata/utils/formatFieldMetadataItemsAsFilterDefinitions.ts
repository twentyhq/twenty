import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { isDefined } from 'twenty-shared/utils';

export const getRelationObjectMetadataNameSingular = ({
  field,
}: {
  field: EnrichedObjectMetadataItem['fields'][0];
}): string | undefined => {
  if (isDefined(field.morphRelations) && field.morphRelations.length > 0) {
    return field.morphRelations[0]?.targetObjectMetadata.nameSingular;
  }

  return field.relation?.targetObjectMetadata.nameSingular;
};
