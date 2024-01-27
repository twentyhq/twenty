import { useQuery } from '@apollo/client';
import { useRecoilValue } from 'recoil';

import { EMPTY_QUERY } from '@/object-metadata/hooks/useObjectMetadataItem';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useGenerateFindManyRecordsForMultipleMetadataItemsQuery } from '@/object-record/hooks/useGenerateFindManyRecordsForMultipleMetadataItemsQuery';
import { useLimitPerMetadataItem } from '@/object-record/relation-picker/hooks/useLimitPerMetadataItem';
import {
  MultiObjectRecordQueryResult,
  useMultiObjectRecordsQueryResultFormattedAsObjectRecordForSelectArray,
} from '@/object-record/relation-picker/hooks/useMultiObjectRecordsQueryResultFormattedAsObjectRecordForSelectArray';
import { SelectedObjectRecordId } from '@/object-record/relation-picker/hooks/useMultiObjectSearch';
import { useOrderByFieldPerMetadataItem } from '@/object-record/relation-picker/hooks/useOrderByFieldPerMetadataItem';
import { useSearchFilterPerMetadataItem } from '@/object-record/relation-picker/hooks/useSearchFilterPerMetadataItem';
import { andFilterVariables } from '@/object-record/utils/andFilterVariables';
import { isDefined } from '~/utils/isDefined';
import { capitalize } from '~/utils/string/capitalize';

export const useMultiObjectSearchMatchesSearchFilterAndToSelectQuery = ({
  selectedObjectRecordIds,
  excludedObjectRecordIds,
  searchFilterValue,
  limit,
}: {
  selectedObjectRecordIds: SelectedObjectRecordId[];
  excludedObjectRecordIds: SelectedObjectRecordId[];
  searchFilterValue: string;
  limit?: number;
}) => {
  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);

  const nonSystemObjectMetadataItems = objectMetadataItems.filter(
    ({ nameSingular, isSystem }) =>
      !isSystem && nameSingular !== CoreObjectNameSingular.Opportunity,
  );

  const { searchFilterPerMetadataItemNameSingular } =
    useSearchFilterPerMetadataItem({
      objectMetadataItems: nonSystemObjectMetadataItems,
      searchFilterValue,
    });

  const objectRecordsToSelectAndMatchesSearchFilterTextFilterPerMetadataItem =
    Object.fromEntries(
      nonSystemObjectMetadataItems
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
            andFilterVariables(searchFilters),
          ];
        })
        .filter(isDefined),
    );

  const { orderByFieldPerMetadataItem } = useOrderByFieldPerMetadataItem({
    objectMetadataItems: nonSystemObjectMetadataItems,
  });

  const { limitPerMetadataItem } = useLimitPerMetadataItem({
    objectMetadataItems: nonSystemObjectMetadataItems,
    limit,
  });

  const multiSelectQuery =
    useGenerateFindManyRecordsForMultipleMetadataItemsQuery({
      objectMetadataItems: nonSystemObjectMetadataItems,
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
