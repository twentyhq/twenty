import { useEffect } from 'react';
import { useQuery } from '@apollo/client';

import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useGenerateFindManyRecordsForMultipleMetadataItemsQuery } from '@/object-record/hooks/useGenerateFindManyRecordsForMultipleMetadataItemsQuery';
import { MultiObjectRecordQueryResult } from '@/object-record/relation-picker/hooks/useMultiObjectRecordsQueryResultFormattedAsObjectRecordForSelectArray';
import { usePrefetchRunQuery } from '@/prefetch/hooks/internal/usePrefetchRunQuery';
import { PrefetchKey } from '@/prefetch/types/PrefetchKey';
import { isDefined } from '~/utils/isDefined';

export const PrefetchRunQueriesEffect = () => {
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
      objectMetadataItems: [objectMetadataItemView, objectMetadataItemFavorite],
      depth: 2,
    });

  if (!isDefined(prefetchFindManyQuery)) {
    throw new Error('Could not prefetch recrds');
  }

  const { data } = useQuery<MultiObjectRecordQueryResult>(
    prefetchFindManyQuery,
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
