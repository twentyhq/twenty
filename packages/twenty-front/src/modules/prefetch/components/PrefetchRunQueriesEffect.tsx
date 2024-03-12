import { useEffect } from 'react';
import { useSetRecoilState } from 'recoil';

import { usePrefetchFindManyCombinedQuery } from '@/prefetch/hooks/usePrefetchCombinedQuery';
import { prefetchIsLoadedFamilyState } from '@/prefetch/states/prefetchIsLoadedFamilyState';
import { PrefetchKey } from '@/prefetch/types/PrefetchKeys';

export const PrefetchRunQueriesEffect = () => {
  const setPrefetchAreViewsLoaded = useSetRecoilState(
    prefetchIsLoadedFamilyState(PrefetchKey.AllViews),
  );
  const setPrefetchAreFavoritesLoaded = useSetRecoilState(
    prefetchIsLoadedFamilyState(PrefetchKey.AllFavorites),
  );

  const { loading } = usePrefetchFindManyCombinedQuery();

  useEffect(() => {
    if (!loading) {
      setPrefetchAreViewsLoaded(true);
      setPrefetchAreFavoritesLoaded(true);
    }
  }, [setPrefetchAreViewsLoaded, loading, setPrefetchAreFavoritesLoaded]);

  return <></>;
};
