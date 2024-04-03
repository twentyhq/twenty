import { useEffect } from 'react';
import { useRecoilValue } from 'recoil';

import { currentUserState } from '@/auth/states/currentUserState';
import { Favorite } from '@/favorites/types/Favorite';
import { useFindManyRecordsForMultipleMetadataItems } from '@/object-record/multiple-objects/hooks/useFindManyRecordsForMultipleMetadataItems';
import { usePrefetchRunQuery } from '@/prefetch/hooks/internal/usePrefetchRunQuery';
import { PrefetchKey } from '@/prefetch/types/PrefetchKey';
import { View } from '@/views/types/View';
import { isDefined } from '~/utils/isDefined';

export const PrefetchRunQueriesEffect = () => {
  const currentUser = useRecoilValue(currentUserState);

  const {
    objectMetadataItem: objectMetadataItemView,
    upsertRecordsInCache: upsertViewsInCache,
  } = usePrefetchRunQuery<View>({
    prefetchKey: PrefetchKey.AllViews,
  });

  const {
    objectMetadataItem: objectMetadataItemFavorite,
    upsertRecordsInCache: upsertFavoritesInCache,
  } = usePrefetchRunQuery<Favorite>({
    prefetchKey: PrefetchKey.AllFavorites,
  });

  const { result } = useFindManyRecordsForMultipleMetadataItems({
    objectMetadataItems: [objectMetadataItemView, objectMetadataItemFavorite],
    skip: !currentUser,
    depth: 1,
  });

  useEffect(() => {
    if (isDefined(result.views)) {
      upsertViewsInCache(result.views as View[]);
    }

    if (isDefined(result.favorites)) {
      upsertFavoritesInCache(result.favorites as Favorite[]);
    }
  }, [result, upsertViewsInCache, upsertFavoritesInCache]);

  return <></>;
};
