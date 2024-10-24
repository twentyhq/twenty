import { useQuery } from '@apollo/client';
import { useRecoilValue } from 'recoil';

import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { EMPTY_QUERY } from '@/object-record/constants/EmptyQuery';
import { useGenerateCombinedSearchRecordsQuery } from '@/object-record/multiple-objects/hooks/useGenerateCombinedSearchRecordsQuery';
import { useLimitPerMetadataItem } from '@/object-record/relation-picker/hooks/useLimitPerMetadataItem';
import {
  MultiObjectRecordQueryResult,
  useMultiObjectRecordsQueryResultFormattedAsObjectRecordForSelectArray,
} from '@/object-record/relation-picker/hooks/useMultiObjectRecordsQueryResultFormattedAsObjectRecordForSelectArray';
import { SelectedObjectRecordId } from '@/object-record/relation-picker/hooks/useMultiObjectSearch';
import { formatSearchResults } from '@/object-record/relation-picker/hooks/useMultiObjectSearchMatchesSearchFilterAndSelectedItemsQuery';
import { isObjectMetadataItemSearchableInCombinedRequest } from '@/object-record/utils/isObjectMetadataItemSearchableInCombinedRequest';
import { makeAndFilterVariables } from '@/object-record/utils/makeAndFilterVariables';
import { isDefined } from '~/utils/isDefined';
import { capitalize } from '~/utils/string/capitalize';

export const useMultiObjectSearchMatchesSearchFilterAndToSelectQuery = ({
  selectedObjectRecordIds,
  excludedObjectRecordIds,
  searchFilterValue,
  limit,
  excludedObjects,
}: {
  selectedObjectRecordIds: SelectedObjectRecordId[];
  excludedObjectRecordIds: SelectedObjectRecordId[];
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
    .filter((object) =>
      isObjectMetadataItemSearchableInCombinedRequest(object),
    );

  const objectRecordsToSelectAndMatchesSearchFilterTextFilterPerMetadataItem =
    Object.fromEntries(
      selectableObjectMetadataItems
        .map(({ nameSingular }) => {
          const selectedIds = selectedObjectRecordIds
            .filter(
              ({ objectNameSingular }) => objectNameSingular === nameSingular,
            )
            .map(({ id }) => id);

          const excludedIds = excludedObjectRecordIds
            .filter(
              ({ objectNameSingular }) => objectNameSingular === nameSingular,
            )
            .map(({ id }) => id);

          const excludedIdsUnion = [...selectedIds, ...excludedIds];
          const excludedIdsFilter = excludedIdsUnion.length
            ? { not: { id: { in: excludedIdsUnion } } }
            : undefined;

          return [
            `filter${capitalize(nameSingular)}`,
            makeAndFilterVariables([excludedIdsFilter]),
          ];
        })
        .filter(isDefined),
    );
  const { limitPerMetadataItem } = useLimitPerMetadataItem({
    objectMetadataItems: selectableObjectMetadataItems,
    limit,
  });

  const multiSelectQuery = useGenerateCombinedSearchRecordsQuery({
    operationSignatures: selectableObjectMetadataItems.map(
      (objectMetadataItem) => ({
        objectNameSingular: objectMetadataItem.nameSingular,
        variables: {},
      }),
    ),
  });

  const {
    loading: toSelectAndMatchesSearchFilterObjectRecordsLoading,
    data: toSelectAndMatchesSearchFilterObjectRecordsQueryResult,
  } = useQuery<MultiObjectRecordQueryResult>(multiSelectQuery ?? EMPTY_QUERY, {
    variables: {
      search: searchFilterValue,
      ...objectRecordsToSelectAndMatchesSearchFilterTextFilterPerMetadataItem,
      ...limitPerMetadataItem,
    },
    skip: !isDefined(multiSelectQuery),
  });

  const {
    objectRecordForSelectArray: toSelectAndMatchesSearchFilterObjectRecords,
  } = useMultiObjectRecordsQueryResultFormattedAsObjectRecordForSelectArray({
    multiObjectRecordsQueryResult: formatSearchResults(
      toSelectAndMatchesSearchFilterObjectRecordsQueryResult,
    ),
  });

  return {
    toSelectAndMatchesSearchFilterObjectRecordsLoading,
    toSelectAndMatchesSearchFilterObjectRecords,
  };
};
