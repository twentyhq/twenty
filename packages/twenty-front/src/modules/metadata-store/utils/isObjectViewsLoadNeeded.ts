import { getExpectedObjectViewsHash } from '@/metadata-store/utils/getExpectedObjectViewsHash';
import { isDefined } from 'twenty-shared/utils';

export const isObjectViewsLoadNeeded = ({
  objectMetadataId,
  loadedViewHashByObjectMetadataId,
  objectViewsHashes,
}: {
  objectMetadataId: string;
  loadedViewHashByObjectMetadataId: Record<string, string> | undefined;
  objectViewsHashes: Record<string, string> | undefined;
}): boolean => {
  const loadedViewHash = loadedViewHashByObjectMetadataId?.[objectMetadataId];

  if (!isDefined(loadedViewHash)) {
    return true;
  }

  if (!isDefined(objectViewsHashes)) {
    return false;
  }

  return (
    loadedViewHash !==
    getExpectedObjectViewsHash({ objectViewsHashes, objectMetadataId })
  );
};
