import { useEffect } from 'react';
import { useRecoilValue } from 'recoil';

import { currentUserState } from '@/auth/states/currentUserState';
import { Favorite } from '@/favorites/types/Favorite';
import { FavoriteFolder } from '@/favorites/types/FavoriteFolder';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useCombinedFindManyRecords } from '@/object-record/multiple-objects/hooks/useCombinedFindManyRecords';
import { PREFETCH_CONFIG } from '@/prefetch/constants/PrefetchConfig';
import { useUpsertRecordsInCacheForPrefetchKey } from '@/prefetch/hooks/internal/useUpsertRecordsInCacheForPrefetchKey';
import { PrefetchKey } from '@/prefetch/types/PrefetchKey';
import { View } from '@/views/types/View';
import { useIsWorkspaceActivationStatusSuspended } from '@/workspace/hooks/useIsWorkspaceActivationStatusSuspended';
import { isDefined } from 'twenty-shared';

export const PrefetchRunQueriesEffect = () => {
  const currentUser = useRecoilValue(currentUserState);

  const isWorkspaceSuspended = useIsWorkspaceActivationStatusSuspended();

  const { upsertRecordsInCache: upsertViewsInCache } =
    useUpsertRecordsInCacheForPrefetchKey<View>({
      prefetchKey: PrefetchKey.AllViews,
    });

  const { upsertRecordsInCache: upsertFavoritesInCache } =
    useUpsertRecordsInCacheForPrefetchKey<Favorite>({
      prefetchKey: PrefetchKey.AllFavorites,
    });
  const { upsertRecordsInCache: upsertFavoritesFoldersInCache } =
    useUpsertRecordsInCacheForPrefetchKey<FavoriteFolder>({
      prefetchKey: PrefetchKey.AllFavoritesFolders,
    });
  const { objectMetadataItems } = useObjectMetadataItems();

  const operationSignatures = Object.values(PREFETCH_CONFIG)

    .map(({ objectNameSingular, operationSignatureFactory }) => {
      const objectMetadataItem = objectMetadataItems.find(
        (item) => item.nameSingular === objectNameSingular,
      );

      return operationSignatureFactory({ objectMetadataItem });
    });

  const { result } = useCombinedFindManyRecords({
    operationSignatures,
    skip: !currentUser || isWorkspaceSuspended,
  });

  useEffect(() => {
    if (isDefined(result.views)) {
      upsertViewsInCache(result.views as View[]);
    }

    if (isDefined(result.favorites)) {
      upsertFavoritesInCache(result.favorites as Favorite[]);
    }
    if (isDefined(result.favoriteFolders)) {
      upsertFavoritesFoldersInCache(result.favoriteFolders as FavoriteFolder[]);
    }
  }, [
    result,
    upsertViewsInCache,
    upsertFavoritesInCache,
    upsertFavoritesFoldersInCache,
  ]);

  return <></>;
};
