import { useQuery } from '@apollo/client';
import { useRecoilValue } from 'recoil';

import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { useGenerateFindManyRecordsForMultipleMetadataItemsV2Query } from '@/object-record/hooks/useGenerateFindManyRecordsForMultipleMetadataItemsV2Query';
import { MultiObjectRecordQueryResult } from '@/object-record/relation-picker/hooks/useMultiObjectRecordsQueryResultFormattedAsObjectRecordForSelectArray';
import { isDefined } from '~/utils/isDefined';

export const usePrefetchFindManyCombinedQuery = () => {
  const objectMetadataItems = useRecoilValue(objectMetadataItemsState());

  const prefetchedObjects = objectMetadataItems.filter(({ nameSingular }) =>
    ['favorite'].includes(nameSingular),
  );

  const prefetchFindManyQuery =
    useGenerateFindManyRecordsForMultipleMetadataItemsV2Query({
      objectMetadataItems: prefetchedObjects,
      depth: 1,
    });

  if (!isDefined(prefetchFindManyQuery)) {
    throw new Error('Could not prefetch recrds');
  }

  const { loading, data } = useQuery<MultiObjectRecordQueryResult>(
    prefetchFindManyQuery,
  );

  return {
    loading,
    data,
  };
};
