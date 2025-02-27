import { useQuery } from '@apollo/client';
import { useRecoilValue } from 'recoil';

import { useLimitPerMetadataItem } from '@/object-metadata/hooks/useLimitPerMetadataItem';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { EMPTY_QUERY } from '@/object-record/constants/EmptyQuery';
import { useGenerateCombinedSearchRecordsQuery } from '@/object-record/multiple-objects/hooks/useGenerateCombinedSearchRecordsQuery';
import { MultiObjectRecordQueryResult } from '@/object-record/multiple-objects/types/MultiObjectRecordQueryResult';
import { isDefined } from 'twenty-shared';

export const useMultiObjectSearch = ({
  searchFilterValue,
  limit,
  excludedObjects,
}: {
  searchFilterValue: string;
  limit?: number;
  excludedObjects?: CoreObjectNameSingular[];
}) => {
  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);

  const selectableObjectMetadataItems = objectMetadataItems.filter(
    ({ nameSingular, isSearchable }) =>
      !excludedObjects?.includes(nameSingular as CoreObjectNameSingular) &&
      isSearchable,
  );

  const { limitPerMetadataItem } = useLimitPerMetadataItem({
    objectMetadataItems,
    limit,
  });

  const multiSelectSearchQueryForSelectedIds =
    useGenerateCombinedSearchRecordsQuery({
      operationSignatures: selectableObjectMetadataItems.map(
        (objectMetadataItem) => ({
          objectNameSingular: objectMetadataItem.nameSingular,
          variables: {},
        }),
      ),
    });

  const {
    loading: matchesSearchFilterObjectRecordsLoading,
    data: matchesSearchFilterObjectRecordsQueryResult,
  } = useQuery<MultiObjectRecordQueryResult>(
    multiSelectSearchQueryForSelectedIds ?? EMPTY_QUERY,
    {
      variables: {
        search: searchFilterValue,
        ...limitPerMetadataItem,
      },
      skip: !isDefined(multiSelectSearchQueryForSelectedIds),
    },
  );

  return {
    matchesSearchFilterObjectRecordsLoading,
    matchesSearchFilterObjectRecordsQueryResult,
  };
};
