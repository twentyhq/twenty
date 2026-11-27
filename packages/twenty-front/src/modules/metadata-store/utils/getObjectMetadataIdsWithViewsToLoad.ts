import { isObjectViewsLoadNeeded } from '@/metadata-store/utils/isObjectViewsLoadNeeded';
import { isNonEmptyString } from '@sniptt/guards';

export const getObjectMetadataIdsWithViewsToLoad = ({
  objectMetadataIds,
  loadedViewHashByObjectMetadataId,
  objectViewsHashes,
}: {
  objectMetadataIds: (string | null | undefined)[];
  loadedViewHashByObjectMetadataId: Record<string, string> | undefined;
  objectViewsHashes: Record<string, string> | undefined;
}): string[] =>
  [...new Set(objectMetadataIds.filter(isNonEmptyString))].filter(
    (objectMetadataId) =>
      isObjectViewsLoadNeeded({
        objectMetadataId,
        loadedViewHashByObjectMetadataId,
        objectViewsHashes,
      }),
  );
