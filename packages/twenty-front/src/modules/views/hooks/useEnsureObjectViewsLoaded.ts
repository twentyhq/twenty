import { useLoadObjectViews } from '@/metadata-store/hooks/useLoadObjectViews';
import { loadedViewsObjectMetadataIdsState } from '@/metadata-store/states/loadedViewsObjectMetadataIdsState';
import { metadataStoreStatusFamilySelector } from '@/metadata-store/states/metadataStoreStatusFamilySelector';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isNonEmptyString } from '@sniptt/guards';
import { useEffect } from 'react';
import { logError } from '~/utils/logError';

export const useEnsureObjectViewsLoaded = (
  objectMetadataIds: (string | null | undefined)[],
) => {
  const loadedViewsObjectMetadataIds = useAtomStateValue(
    loadedViewsObjectMetadataIdsState,
  );
  const viewsStatus = useAtomFamilySelectorValue(
    metadataStoreStatusFamilySelector,
    'views',
  );
  const { loadObjectViews } = useLoadObjectViews();

  const objectMetadataIdsToLoadKey =
    viewsStatus === 'up-to-date'
      ? [
          ...new Set(
            objectMetadataIds
              .filter(isNonEmptyString)
              .filter(
                (objectMetadataId) =>
                  !loadedViewsObjectMetadataIds.includes(objectMetadataId),
              ),
          ),
        ].join(',')
      : '';

  useEffect(() => {
    if (!isNonEmptyString(objectMetadataIdsToLoadKey)) {
      return;
    }

    for (const objectMetadataId of objectMetadataIdsToLoadKey.split(',')) {
      loadObjectViews(objectMetadataId).catch(logError);
    }
  }, [objectMetadataIdsToLoadKey, loadObjectViews]);
};
