import { gql, useQuery } from '@apollo/client';
import { isNonEmptyArray } from '@sniptt/guards';
import { useRecoilValue } from 'recoil';

import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { useGenerateCombinedFindManyRecordsQuery } from '@/object-record/multiple-objects/hooks/useGenerateCombinedFindManyRecordsQuery';
import { useLimitPerMetadataItem } from '@/object-record/relation-picker/hooks/useLimitPerMetadataItem';
import {
  MultiObjectRecordQueryResult,
  useMultiObjectRecordsQueryResultFormattedAsObjectRecordForSelectArray,
} from '@/object-record/relation-picker/hooks/useMultiObjectRecordsQueryResultFormattedAsObjectRecordForSelectArray';
import { useOrderByFieldPerMetadataItem } from '@/object-record/relation-picker/hooks/useOrderByFieldPerMetadataItem';
import { SelectedObjectRecordId } from '@/object-record/types/SelectedObjectRecordId';
import { capitalize } from 'twenty-shared';
import { isDefined } from '~/utils/isDefined';

export const EMPTY_QUERY = gql`
  query Empty {
    __typename
  }
`;

export const useMultiObjectSearchSelectedItemsQuery = ({
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
  } = useQuery<MultiObjectRecordQueryResult>(
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
    useMultiObjectRecordsQueryResultFormattedAsObjectRecordForSelectArray({
      multiObjectRecordsQueryResult: selectedObjectRecordsQueryResult,
    });

  return {
    selectedObjectRecordsLoading,
    selectedObjectRecords,
  };
};
