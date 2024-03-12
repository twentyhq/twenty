import { useQuery } from '@apollo/client';
import { useRecoilValue } from 'recoil';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { useUpsertFindManyRecordsQueryInCache } from '@/object-record/cache/hooks/useUpsertFindManyRecordsQueryInCache';
import { useGenerateFindManyRecordsForMultipleMetadataItemsV2Query } from '@/object-record/hooks/useGenerateFindManyRecordsForMultipleMetadataItemsV2Query';
import { useMapConnectionToRecords } from '@/object-record/hooks/useMapConnectionToRecords';
import { MultiObjectRecordQueryResult } from '@/object-record/relation-picker/hooks/useMultiObjectRecordsQueryResultFormattedAsObjectRecordForSelectArray';
import { isDefined } from '~/utils/isDefined';

export const usePrefetchFindManyCombinedQuery = () => {
  const objectMetadataItems = useRecoilValue(objectMetadataItemsState());

  const { objectMetadataItem: objectMetadataItemView } = useObjectMetadataItem({
    objectNameSingular: 'view',
  });

  const { objectMetadataItem: objectMetadataItemFavorite } =
    useObjectMetadataItem({
      objectNameSingular: 'favorite',
    });

  const prefetchedObjects = objectMetadataItems.filter(({ nameSingular }) =>
    ['favorite', 'view'].includes(nameSingular),
  );

  const prefetchFindManyQuery =
    useGenerateFindManyRecordsForMultipleMetadataItemsV2Query({
      objectMetadataItems: prefetchedObjects,
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

  if (isDefined(data?.views)) {
    upsertFindManyViewsInCache({
      queryVariables: {},
      depth: 2,
      objectRecordsToOverwrite:
        mapConnectionToRecords({
          objectRecordConnection: data.views,
          objectNameSingular: 'view',
          depth: 3,
        }) ?? [],
    });
  }

  return {
    loading,
    data,
  };
};
