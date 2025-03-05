import { gql } from '@apollo/client';

export const EMPTY_QUERY = gql`
  query Empty {
    __typename
  }
`;

export const useMultipleRecordPickerSearchSelectedItemsQuery = () =>
  // {
  //   // selectedRecordsWithObjectMetadataItem,
  // }: {
  //   // selectedRecordsWithObjectMetadataItem: RecordWithObjectMetadataItem[];
  // },
  {
    // const objectMetadataItems = useRecoilValue(objectMetadataItemsState);

    // const objectMetadataItemsUsedInSelectedIdsQuery = objectMetadataItems.filter(
    //   ({ nameSingular }) => {
    //     return selectedRecordsWithObjectMetadataItem.some(
    //       ({ objectMetadataItem }) => {
    //         return objectNameSingular === nameSingular;
    //       },
    //     );
    //   },
    // );

    // const selectedIdFilterPerMetadataItem = Object.fromEntries(
    //   objectMetadataItemsUsedInSelectedIdsQuery
    //     .map(({ nameSingular }) => {
    //       const selectedIds = selectedObjectRecordIds
    //         .filter(
    //           ({ objectNameSingular }) => objectNameSingular === nameSingular,
    //         )
    //         .map(({ recordId }) => recordId);

    //       if (!isNonEmptyArray(selectedIds)) return null;

    //       return [
    //         `filter${capitalize(nameSingular)}`,
    //         {
    //           id: {
    //             in: selectedIds,
    //           },
    //         },
    //       ];
    //     })
    //     .filter(isDefined),
    // );

    // const { orderByFieldPerMetadataItem } = useOrderByFieldPerMetadataItem({
    //   objectMetadataItems: objectMetadataItemsUsedInSelectedIdsQuery,
    // });

    // const { limitPerMetadataItem } = useLimitPerMetadataItem({
    //   objectMetadataItems: objectMetadataItemsUsedInSelectedIdsQuery,
    // });

    // const multiSelectQueryForSelectedIds =
    //   useGenerateCombinedFindManyRecordsQuery({
    //     operationSignatures: objectMetadataItemsUsedInSelectedIdsQuery.map(
    //       (objectMetadataItem) => ({
    //         objectNameSingular: objectMetadataItem.nameSingular,
    //         variables: {},
    //       }),
    //     ),
    //   });

    // const {
    //   loading: selectedObjectRecordsLoading,
    //   data: selectedObjectRecordsQueryResult,
    // } = useQuery<CombinedFindManyRecordsQueryResult>(
    //   multiSelectQueryForSelectedIds ?? EMPTY_QUERY,
    //   {
    //     variables: {
    //       ...selectedIdFilterPerMetadataItem,
    //       ...orderByFieldPerMetadataItem,
    //       ...limitPerMetadataItem,
    //     },
    //     skip: !isDefined(multiSelectQueryForSelectedIds),
    //   },
    // );

    // const { objectRecordForSelectArray: selectedObjectRecords } =
    //   useMultipleRecordPickerQueryResultFormattedAsObjectRecordForSelectArray({
    //     multiObjectRecordsQueryResult: selectedObjectRecordsQueryResult,
    //   });

    return {
      // selectedObjectRecordsLoading,
      // selectedObjectRecords,
    };
  };
