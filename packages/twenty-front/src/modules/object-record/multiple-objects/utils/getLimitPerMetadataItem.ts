import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { capitalize, isDefined } from 'twenty-shared';

export const getLimitPerMetadataItem = (
  objectMetadataItems: Pick<ObjectMetadataItem, 'nameSingular'>[],
  limit: number,
) => {
  return Object.fromEntries(
    objectMetadataItems
      .map(({ nameSingular }) => {
        return [`limit${capitalize(nameSingular)}`, limit];
      })
      .filter(isDefined),
  );
};
