import { gql, useQuery } from '@apollo/client';
import { isNonEmptyArray } from '@sniptt/guards';
import { useRecoilValue } from 'recoil';

import { useLimitPerMetadataItem } from '@/object-metadata/hooks/useLimitPerMetadataItem';
import { useOrderByFieldPerMetadataItem } from '@/object-metadata/hooks/useOrderByFieldPerMetadataItem';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { useGenerateCombinedFindManyRecordsQuery } from '@/object-record/multiple-objects/hooks/useGenerateCombinedFindManyRecordsQuery';
import { CombinedFindManyRecordsQueryResult } from '@/object-record/multiple-objects/types/CombinedFindManyRecordsQueryResult';
import { useMultipleRecordPickerQueryResultFormattedAsObjectRecordForSelectArray } from '@/object-record/record-picker/multiple-record-picker/hooks/useMultipleRecordPickerQueryResultFormattedAsObjectRecordForSelectArray';
import { SelectedObjectRecordId } from '@/object-record/types/SelectedObjectRecordId';
import { capitalize, isDefined } from 'twenty-shared';

export const EMPTY_QUERY = gql`
  query Empty {
    __typename
  }
`;

export const useMultipleRecordPickerSearchSelectedItemsQuery = ({
  selectedObjectRecordIds,
}: {
  selectedObjectRecordIds: SelectedObjectRecordId[];
}) => {
  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);

  const objectMetadataItemsUsedInSelectedIdsQuery = objectMetadataItems.filter(
    ({ nameSingular }) => {
      return selectedObjectRecordIds.some(({ objectNameSingular }) => {
        return objectNameSingular === nameSingular;
      });
    },
  );

  const selectedIdFilterPerMetadataItem = Object.fromEntries(
    objectMetadataItemsUsedInSelectedIdsQuery
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

  const { orderByFieldPerMetadataItem } = useOrderByFieldPerMetadataItem({
    objectMetadataItems: objectMetadataItemsUsedInSelectedIdsQuery,
  });

  const { limitPerMetadataItem } = useLimitPerMetadataItem({
    objectMetadataItems: objectMetadataItemsUsedInSelectedIdsQuery,
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
    loading: selectedObjectRecordsLoading,
    data: selectedObjectRecordsQueryResult,
  } = useQuery<CombinedFindManyRecordsQueryResult>(
    multiSelectQueryForSelectedIds ?? EMPTY_QUERY,
    {
      variables: {
        ...selectedIdFilterPerMetadataItem,
        ...orderByFieldPerMetadataItem,
        ...limitPerMetadataItem,
      },
      skip: !isDefined(multiSelectQueryForSelectedIds),
    },
  );

  const { objectRecordForSelectArray: selectedObjectRecords } =
    useMultipleRecordPickerQueryResultFormattedAsObjectRecordForSelectArray({
      multiObjectRecordsQueryResult: selectedObjectRecordsQueryResult,
    });

  return {
    selectedObjectRecordsLoading,
    selectedObjectRecords,
  };
};
