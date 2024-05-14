import { useQuery } from '@apollo/client';
import { isNonEmptyArray } from '@sniptt/guards';
import { useRecoilValue } from 'recoil';

import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { EMPTY_QUERY } from '@/object-record/constants/EmptyQuery';
import { useGenerateCombinedFindManyRecordsQuery } from '@/object-record/multiple-objects/hooks/useGenerateCombinedFindManyRecordsQuery';
import { useLimitPerMetadataItem } from '@/object-record/relation-picker/hooks/useLimitPerMetadataItem';
import {
  MultiObjectRecordQueryResult,
  useMultiObjectRecordsQueryResultFormattedAsObjectRecordForSelectArray,
} from '@/object-record/relation-picker/hooks/useMultiObjectRecordsQueryResultFormattedAsObjectRecordForSelectArray';
import { SelectedObjectRecordId } from '@/object-record/relation-picker/hooks/useMultiObjectSearch';
import { useOrderByFieldPerMetadataItem } from '@/object-record/relation-picker/hooks/useOrderByFieldPerMetadataItem';
import { useSearchFilterPerMetadataItem } from '@/object-record/relation-picker/hooks/useSearchFilterPerMetadataItem';
import { isDefined } from '~/utils/isDefined';
import { capitalize } from '~/utils/string/capitalize';

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

  const { searchFilterPerMetadataItemNameSingular } =
    useSearchFilterPerMetadataItem({
      objectMetadataItems,
      searchFilterValue,
    });

  const objectMetadataItemsUsedInSelectedIdsQuery = objectMetadataItems.filter(
    ({ nameSingular }) => {
      return selectedObjectRecordIds.some(({ objectNameSingular }) => {
        return objectNameSingular === nameSingular;
      });
    },
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

          const searchFilter =
            searchFilterPerMetadataItemNameSingular[nameSingular] ?? {};
          return [
            `filter${capitalize(nameSingular)}`,
            {
              and: [
                {
                  ...searchFilter,
                },
                {
                  id: {
                    in: selectedIds,
                  },
                },
              ],
            },
          ];
        })
        .filter(isDefined),
    );

  const { orderByFieldPerMetadataItem } = useOrderByFieldPerMetadataItem({
    objectMetadataItems: objectMetadataItemsUsedInSelectedIdsQuery,
  });

  const { limitPerMetadataItem } = useLimitPerMetadataItem({
    objectMetadataItems: objectMetadataItemsUsedInSelectedIdsQuery,
    limit,
  });

  const multiSelectQueryForSelectedIds =
    useGenerateCombinedFindManyRecordsQuery({
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
    multiSelectQueryForSelectedIds ?? EMPTY_QUERY,
    {
      variables: {
        ...selectedAndMatchesSearchFilterTextFilterPerMetadataItem,
        ...orderByFieldPerMetadataItem,
        ...limitPerMetadataItem,
      },
      skip: !isDefined(multiSelectQueryForSelectedIds),
    },
  );

  const {
    objectRecordForSelectArray: selectedAndMatchesSearchFilterObjectRecords,
  } = useMultiObjectRecordsQueryResultFormattedAsObjectRecordForSelectArray({
    multiObjectRecordsQueryResult:
      selectedAndMatchesSearchFilterObjectRecordsQueryResult,
  });

  return {
    selectedAndMatchesSearchFilterObjectRecordsLoading,
    selectedAndMatchesSearchFilterObjectRecords,
  };
};
