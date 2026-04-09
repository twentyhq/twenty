import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

const FAVORITE_STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS = [
  STANDARD_OBJECTS.favorite.universalIdentifier,
  STANDARD_OBJECTS.favoriteFolder.universalIdentifier,
] as const;

export const isFavoriteRelatedObject = (objectMetadata: {
  universalIdentifier: string;
}): boolean => {
  return FAVORITE_STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.includes(
    objectMetadata.universalIdentifier as (typeof FAVORITE_STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS)[number],
  );
};
