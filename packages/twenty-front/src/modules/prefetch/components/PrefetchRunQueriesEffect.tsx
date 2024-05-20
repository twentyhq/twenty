import { useEffect } from 'react';
import { useRecoilValue } from 'recoil';

import { currentUserState } from '@/auth/states/currentUserState';
import { Favorite } from '@/favorites/types/Favorite';
import { useCombinedFindManyRecords } from '@/object-record/multiple-objects/hooks/useCombinedFindManyRecords';
import { usePrefetchRunQuery } from '@/prefetch/hooks/internal/usePrefetchRunQuery';
import { FIND_ALL_FAVORITES_OPERATION_SIGNATURE } from '@/prefetch/query-keys/FindAllFavoritesOperationSignature';
import { FIND_ALL_VIEWS_OPERATION_SIGNATURE } from '@/prefetch/query-keys/FindAllViewsOperationSignature';
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
    operationSignatures: [
      FIND_ALL_VIEWS_OPERATION_SIGNATURE,
      FIND_ALL_FAVORITES_OPERATION_SIGNATURE,
    ],
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
