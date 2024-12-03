import { useQuery } from '@apollo/client';
import { useRecoilValue } from 'recoil';

import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { EMPTY_QUERY } from '@/object-record/constants/EmptyQuery';
import { useGenerateCombinedSearchRecordsQuery } from '@/object-record/multiple-objects/hooks/useGenerateCombinedSearchRecordsQuery';
import { useLimitPerMetadataItem } from '@/object-record/relation-picker/hooks/useLimitPerMetadataItem';
import { MultiObjectRecordQueryResult } from '@/object-record/relation-picker/hooks/useMultiObjectRecordsQueryResultFormattedAsObjectRecordForSelectArray';
import { isObjectMetadataItemSearchableInCombinedRequest } from '@/object-record/utils/isObjectMetadataItemSearchableInCombinedRequest';
import { isDefined } from '~/utils/isDefined';

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

  const selectableObjectMetadataItems = objectMetadataItems
    .filter(({ isSystem, isRemote }) => !isSystem && !isRemote)
    .filter(({ nameSingular }) => {
      return !excludedObjects?.includes(nameSingular as CoreObjectNameSingular);
    })
    .filter((objectMetadataItem) =>
      isObjectMetadataItemSearchableInCombinedRequest(objectMetadataItem),
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
