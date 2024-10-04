import { useQuery } from '@apollo/client';
import { useRecoilValue } from 'recoil';

import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
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
    });

  const { searchFilterPerMetadataItemNameSingular } =
    useSearchFilterPerMetadataItem({
      objectMetadataItems: selectableObjectMetadataItems,
      searchFilterValue,
    });

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

          const searchFilters = [
            searchFilterPerMetadataItemNameSingular[nameSingular],
            excludedIdsFilter,
          ];

          return [
            `filter${capitalize(nameSingular)}`,
            makeAndFilterVariables(searchFilters),
          ];
        })
        .filter(isDefined),
    );

  const { orderByFieldPerMetadataItem } = useOrderByFieldPerMetadataItem({
    objectMetadataItems: selectableObjectMetadataItems,
  });

  const { limitPerMetadataItem } = useLimitPerMetadataItem({
    objectMetadataItems: selectableObjectMetadataItems,
    limit,
  });

  const multiSelectQuery = useGenerateCombinedFindManyRecordsQuery({
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
      ...objectRecordsToSelectAndMatchesSearchFilterTextFilterPerMetadataItem,
      ...orderByFieldPerMetadataItem,
      ...limitPerMetadataItem,
    },
    skip: !isDefined(multiSelectQuery),
  });

  const {
    objectRecordForSelectArray: toSelectAndMatchesSearchFilterObjectRecords,
  } = useMultiObjectRecordsQueryResultFormattedAsObjectRecordForSelectArray({
    multiObjectRecordsQueryResult:
      toSelectAndMatchesSearchFilterObjectRecordsQueryResult,
  });

  return {
    toSelectAndMatchesSearchFilterObjectRecordsLoading,
    toSelectAndMatchesSearchFilterObjectRecords,
  };
};
