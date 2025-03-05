import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { CombinedFindManyRecordsQueryResult } from '@/object-record/multiple-objects/types/CombinedFindManyRecordsQueryResult';
import { generateCombinedSearchRecordsQuery } from '@/object-record/multiple-objects/utils/generateCombinedSearchRecordsQuery';
import { multipleRecordPickerPickableMorphItemsComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerPickableMorphItemsComponentState';
import { multipleRecordPickerSearchFilterComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerSearchFilterComponentState';
import { multipleRecordPickerSearchableObjectMetadataItemsComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerSearchableObjectMetadataItemsComponentState';
import { multipleRecordPickerformatQueryResultAsRecordsWithObjectMetadataId } from '@/object-record/record-picker/multiple-record-picker/utils/multipleRecordPickerformatQueryResultAsRecordWithObjectMetadataId';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useApolloClient } from '@apollo/client';
import { useRecoilCallback } from 'recoil';
import { capitalize, isDefined } from 'twenty-shared';

export const useMultipleRecordPickerPerformSearch = () => {
  const client = useApolloClient();

  const performSearch = useRecoilCallback(
    ({ snapshot, set }) =>
      async ({
        multipleRecordPickerInstanceId,
        forceSearchFilter = '',
        forceSearchableObjectMetadataItems = [],
      }: {
        multipleRecordPickerInstanceId: string;
        forceSearchFilter?: string;
        forceSearchableObjectMetadataItems?: ObjectMetadataItem[];
      }) => {
        const recordPickerSearchFilter = snapshot
          .getLoadable(
            multipleRecordPickerSearchFilterComponentState.atomFamily({
              instanceId: multipleRecordPickerInstanceId,
            }),
          )
          .getValue();

        const searchFilter = forceSearchFilter ?? recordPickerSearchFilter;

        const recordPickerSearchableObjectMetadataItems = snapshot
          .getLoadable(
            multipleRecordPickerSearchableObjectMetadataItemsComponentState.atomFamily(
              { instanceId: multipleRecordPickerInstanceId },
            ),
          )
          .getValue();

        const searchableObjectMetadataItems =
          forceSearchableObjectMetadataItems.length > 0
            ? forceSearchableObjectMetadataItems
            : recordPickerSearchableObjectMetadataItems;

        const combinedSearchRecordsQuery = generateCombinedSearchRecordsQuery({
          objectMetadataItems: searchableObjectMetadataItems,
          operationSignatures: searchableObjectMetadataItems.map(
            (objectMetadataItem) => ({
              objectNameSingular: objectMetadataItem.nameSingular,
              variables: {},
            }),
          ),
        });

        const limitPerMetadataItem = Object.fromEntries(
          searchableObjectMetadataItems
            .map(({ nameSingular }) => {
              return [`limit${capitalize(nameSingular)}`, 10];
            })
            .filter(isDefined),
        );

        const { data: combinedSearchRecordsQueryResult } =
          await client.query<CombinedFindManyRecordsQueryResult>({
            query: combinedSearchRecordsQuery,
            variables: {
              search: searchFilter,
              ...limitPerMetadataItem,
            },
          });

        const { recordsWithObjectMetadataId } =
          multipleRecordPickerformatQueryResultAsRecordsWithObjectMetadataId({
            objectMetadataItems: searchableObjectMetadataItems,
            searchQueryResult: combinedSearchRecordsQueryResult,
          });

        set(
          multipleRecordPickerPickableMorphItemsComponentState.atomFamily({
            instanceId: multipleRecordPickerInstanceId,
          }),
          recordsWithObjectMetadataId.map(({ record, objectMetadataItem }) => ({
            isMatchingSearchFilter: true,
            isSelected: false,
            objectMetadataId: objectMetadataItem.id,
            recordId: record.id,
          })),
        );

        recordsWithObjectMetadataId.forEach(({ record }) => {
          set(recordStoreFamilyState(record.id), record);
        });
      },
    [client],
  );

  return { performSearch };
};
