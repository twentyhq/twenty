import { useLoadObjectViews } from '@/metadata-store/hooks/useLoadObjectViews';
import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { objectViewsHashesState } from '@/metadata-store/states/objectViewsHashesState';
import { isObjectViewsLoadNeeded } from '@/metadata-store/utils/isObjectViewsLoadNeeded';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isNonEmptyString } from '@sniptt/guards';
import { useEffect } from 'react';
import { logError } from '~/utils/logError';

export const useEnsureObjectViewsLoaded = (
  objectMetadataIds: (string | null | undefined)[],
) => {
  const metadataStore = useAtomFamilyStateValue(metadataStoreState, 'views');
  const objectViewsHashes = useAtomStateValue(objectViewsHashesState);
  const { loadObjectViews } = useLoadObjectViews();

  const objectMetadataIdsToLoad =
    metadataStore.status === 'up-to-date'
      ? [...new Set(objectMetadataIds.filter(isNonEmptyString))].filter(
          (objectMetadataId) =>
            isObjectViewsLoadNeeded({
              objectMetadataId,
              loadedViewHashByObjectMetadataId:
                metadataStore.loadedViewHashByObjectMetadataId,
              objectViewsHashes,
            }),
        )
      : [];

  const objectMetadataIdsToLoadKey = objectMetadataIdsToLoad.join(',');

  useEffect(() => {
    if (!isNonEmptyString(objectMetadataIdsToLoadKey)) {
      return;
    }

    for (const objectMetadataId of objectMetadataIdsToLoadKey.split(',')) {
      loadObjectViews(objectMetadataId).catch(logError);
    }
  }, [objectMetadataIdsToLoadKey, loadObjectViews]);
};
