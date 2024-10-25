import { useQuery } from '@apollo/client';
import { isNonEmptyArray } from '@sniptt/guards';
import { useRecoilValue } from 'recoil';

import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { EMPTY_QUERY } from '@/object-record/constants/EmptyQuery';
import { useGenerateCombinedSearchRecordsQuery } from '@/object-record/multiple-objects/hooks/useGenerateCombinedSearchRecordsQuery';
import { useLimitPerMetadataItem } from '@/object-record/relation-picker/hooks/useLimitPerMetadataItem';
import {
  MultiObjectRecordQueryResult,
  useMultiObjectRecordsQueryResultFormattedAsObjectRecordForSelectArray,
} from '@/object-record/relation-picker/hooks/useMultiObjectRecordsQueryResultFormattedAsObjectRecordForSelectArray';
import { SelectedObjectRecordId } from '@/object-record/relation-picker/hooks/useMultiObjectSearch';
import { useMemo } from 'react';
import { isDefined } from '~/utils/isDefined';
import { capitalize } from '~/utils/string/capitalize';

export const formatSearchResults = (
  searchResults: MultiObjectRecordQueryResult | undefined,
): MultiObjectRecordQueryResult => {
  if (!searchResults) {
    return {};
  }

  return Object.entries(searchResults).reduce((acc, [key, value]) => {
    let newKey = key.replace(/^search/, '');
    newKey = newKey.charAt(0).toLowerCase() + newKey.slice(1);
    acc[newKey] = value;
    return acc;
  }, {} as MultiObjectRecordQueryResult);
};

export const useMultiObjectSearchMatchesSearchFilterAndSelectedItemsQuery = ({
  selectedObjectRecordIds,
  searchFilterValue,
  limit,
}: {
  selectedObjectRecordIds: SelectedObjectRecordId[];
  searchFilterValue: string;
  limit?: number;
}) => {
  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);

  const objectMetadataItemsUsedInSelectedIdsQuery = useMemo(
    () =>
      objectMetadataItems.filter(({ nameSingular }) => {
        return selectedObjectRecordIds.some(({ objectNameSingular }) => {
          return objectNameSingular === nameSingular;
        });
      }),
    [objectMetadataItems, selectedObjectRecordIds],
  );

  const selectedAndMatchesSearchFilterTextFilterPerMetadataItem =
    Object.fromEntries(
      objectMetadataItems
        .map(({ nameSingular }) => {
          const selectedIds = selectedObjectRecordIds
            .filter(
              ({ objectNameSingular }) => objectNameSingular === nameSingular,
            )
            .map(({ id }) => id);

          if (!isNonEmptyArray(selectedIds)) return null;

          return [
            `filter${capitalize(nameSingular)}`,
            {
              id: {
                in: selectedIds,
              },
            },
          ];
        })
        .filter(isDefined),
    );

  const { limitPerMetadataItem } = useLimitPerMetadataItem({
    objectMetadataItems: objectMetadataItemsUsedInSelectedIdsQuery,
    limit,
  });

  const multiSelectSearchQueryForSelectedIds =
    useGenerateCombinedSearchRecordsQuery({
      operationSignatures: objectMetadataItemsUsedInSelectedIdsQuery.map(
        (objectMetadataItem) => ({
          objectNameSingular: objectMetadataItem.nameSingular,
          variables: {},
        }),
      ),
    });

  const {
    loading: selectedAndMatchesSearchFilterObjectRecordsLoading,
    data: selectedAndMatchesSearchFilterObjectRecordsQueryResult,
  } = useQuery<MultiObjectRecordQueryResult>(
    multiSelectSearchQueryForSelectedIds ?? EMPTY_QUERY,
    {
      variables: {
        search: searchFilterValue,
        ...selectedAndMatchesSearchFilterTextFilterPerMetadataItem,
        ...limitPerMetadataItem,
      },
      skip: !isDefined(multiSelectSearchQueryForSelectedIds),
    },
  );

  const {
    objectRecordForSelectArray: selectedAndMatchesSearchFilterObjectRecords,
  } = useMultiObjectRecordsQueryResultFormattedAsObjectRecordForSelectArray({
    multiObjectRecordsQueryResult: formatSearchResults(
      selectedAndMatchesSearchFilterObjectRecordsQueryResult,
    ),
  });

  return {
    selectedAndMatchesSearchFilterObjectRecordsLoading,
    selectedAndMatchesSearchFilterObjectRecords,
  };
};
