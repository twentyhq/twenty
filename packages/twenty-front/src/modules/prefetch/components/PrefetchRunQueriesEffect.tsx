import { useEffect } from 'react';
import { useRecoilValue } from 'recoil';

import { currentUserState } from '@/auth/states/currentUserState';
import { Favorite } from '@/favorites/types/Favorite';
import { useCombinedFindManyRecords } from '@/object-record/multiple-objects/hooks/useCombinedFindManyRecords';
import { usePrefetchRunQuery } from '@/prefetch/hooks/internal/usePrefetchRunQuery';
import { ALL_FAVORITES_QUERY_KEY } from '@/prefetch/query-keys/AllFavoritesQueryKey';
import { ALL_VIEWS_QUERY_KEY } from '@/prefetch/query-keys/AllViewsQueryKey';
import { PrefetchKey } from '@/prefetch/types/PrefetchKey';
import { View } from '@/views/types/View';
import { isDefined } from '~/utils/isDefined';

export const PrefetchRunQueriesEffect = () => {
  const currentUser = useRecoilValue(currentUserState);

  const { upsertRecordsInCache: upsertViewsInCache } =
    usePrefetchRunQuery<View>({
      prefetchKey: PrefetchKey.AllViews,
    });

  const { upsertRecordsInCache: upsertFavoritesInCache } =
    usePrefetchRunQuery<Favorite>({
      prefetchKey: PrefetchKey.AllFavorites,
    });

  const { result } = useCombinedFindManyRecords({
    queryKeys: [ALL_VIEWS_QUERY_KEY, ALL_FAVORITES_QUERY_KEY],
    skip: !currentUser,
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
