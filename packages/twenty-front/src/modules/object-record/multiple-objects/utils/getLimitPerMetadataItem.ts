import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { capitalize } from 'twenty-shared/utils';

export const getLimitPerMetadataItem = (
  objectMetadataItems: Pick<EnrichedObjectMetadataItem, 'nameSingular'>[],
  limit: number,
) => {
  return Object.fromEntries(
    objectMetadataItems.map(({ nameSingular }) => {
      return [`limit${capitalize(nameSingular)}`, limit];
    }),
  );
};
