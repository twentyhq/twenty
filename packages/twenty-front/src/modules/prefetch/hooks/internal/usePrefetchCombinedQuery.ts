import { useQuery } from '@apollo/client';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useUpsertFindManyRecordsQueryInCache } from '@/object-record/cache/hooks/useUpsertFindManyRecordsQueryInCache';
import { useGenerateFindManyRecordsForMultipleMetadataItemsQuery } from '@/object-record/hooks/useGenerateFindManyRecordsForMultipleMetadataItemsQuery';
import { useMapConnectionToRecords } from '@/object-record/hooks/useMapConnectionToRecords';
import { MultiObjectRecordQueryResult } from '@/object-record/relation-picker/hooks/useMultiObjectRecordsQueryResultFormattedAsObjectRecordForSelectArray';
import { ALL_FAVORITES_QUERY_KEY } from '@/prefetch/query-keys/AllFavoritesQueryKey';
import { ALL_VIEWS_QUERY_KEY } from '@/prefetch/query-keys/AllViewsQueryKey';
import { isDefined } from '~/utils/isDefined';

export const usePrefetchFindManyCombinedQuery = () => {
  const { objectMetadataItem: objectMetadataItemView } = useObjectMetadataItem({
    objectNameSingular: CoreObjectNameSingular.View,
  });

  const { objectMetadataItem: objectMetadataItemFavorite } =
    useObjectMetadataItem({
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

  const mapConnectionToRecords = useMapConnectionToRecords();

  const { loading, data } = useQuery<MultiObjectRecordQueryResult>(
    prefetchFindManyQuery,
  );

  const { upsertFindManyRecordsQueryInCache: upsertFindManyViewsInCache } =
    useUpsertFindManyRecordsQueryInCache({
      objectMetadataItem: objectMetadataItemView,
    });

  const { upsertFindManyRecordsQueryInCache: upsertFindManyFavoritesInCache } =
    useUpsertFindManyRecordsQueryInCache({
      objectMetadataItem: objectMetadataItemFavorite,
    });

  if (isDefined(data?.views)) {
    upsertFindManyViewsInCache({
      queryVariables: ALL_VIEWS_QUERY_KEY.variables,
      depth: ALL_VIEWS_QUERY_KEY.depth,
      objectRecordsToOverwrite:
        mapConnectionToRecords({
          objectRecordConnection: data.views,
          objectNameSingular: CoreObjectNameSingular.View,
          depth: 2,
        }) ?? [],
    });
  }

  if (isDefined(data?.views)) {
    upsertFindManyFavoritesInCache({
      queryVariables: ALL_FAVORITES_QUERY_KEY.variables,
      depth: ALL_FAVORITES_QUERY_KEY.depth,
      objectRecordsToOverwrite:
        mapConnectionToRecords({
          objectRecordConnection: data.favorites,
          objectNameSingular: CoreObjectNameSingular.Favorite,
          depth: 2,
        }) ?? [],
    });
  }

  return {
    loading,
    data,
  };
};
