import { useLoadObjectViews } from '@/metadata-store/hooks/useLoadObjectViews';
import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { objectViewsHashesState } from '@/metadata-store/states/objectViewsHashesState';
import { getObjectMetadataIdsWithViewsToLoad } from '@/metadata-store/utils/getObjectMetadataIdsWithViewsToLoad';
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
      ? getObjectMetadataIdsWithViewsToLoad({
          objectMetadataIds,
          loadedViewHashByObjectMetadataId:
            metadataStore.loadedViewHashByObjectMetadataId,
          objectViewsHashes,
        })
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
