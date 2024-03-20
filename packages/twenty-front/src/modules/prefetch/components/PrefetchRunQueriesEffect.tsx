import { useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { useRecoilValue } from 'recoil';

import { currentUserState } from '@/auth/states/currentUserState';
import { EMPTY_QUERY } from '@/object-metadata/hooks/useObjectMetadataItem';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useGenerateFindManyRecordsForMultipleMetadataItemsQuery } from '@/object-record/hooks/useGenerateFindManyRecordsForMultipleMetadataItemsQuery';
import { MultiObjectRecordQueryResult } from '@/object-record/relation-picker/hooks/useMultiObjectRecordsQueryResultFormattedAsObjectRecordForSelectArray';
import { usePrefetchRunQuery } from '@/prefetch/hooks/internal/usePrefetchRunQuery';
import { PrefetchKey } from '@/prefetch/types/PrefetchKey';
import { isDefined } from '~/utils/isDefined';

export const PrefetchRunQueriesEffect = () => {
  const currentUser = useRecoilValue(currentUserState);

  const {
    objectMetadataItem: objectMetadataItemView,
    upsertRecordsInCache: upsertViewsInCache,
  } = usePrefetchRunQuery({
    prefetchKey: PrefetchKey.AllViews,
    objectNameSingular: CoreObjectNameSingular.View,
  });

  const {
    objectMetadataItem: objectMetadataItemFavorite,
    upsertRecordsInCache: upsertFavoritesInCache,
  } = usePrefetchRunQuery({
    prefetchKey: PrefetchKey.AllFavorites,
    objectNameSingular: CoreObjectNameSingular.Favorite,
  });

  const prefetchFindManyQuery =
    useGenerateFindManyRecordsForMultipleMetadataItemsQuery({
      targetObjectMetadataItems: [
        objectMetadataItemView,
        objectMetadataItemFavorite,
      ],
      depth: 2,
    });

  const { data } = useQuery<MultiObjectRecordQueryResult>(
    prefetchFindManyQuery ?? EMPTY_QUERY,
    {
      skip: !currentUser,
    },
  );

  useEffect(() => {
    if (isDefined(data?.views)) {
      upsertViewsInCache(data.views);
    }

    if (isDefined(data?.favorites)) {
      upsertFavoritesInCache(data.favorites);
    }
  }, [data, upsertViewsInCache, upsertFavoritesInCache]);

  return <></>;
};
