import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { CombinedFindManyRecordsQueryResult } from '@/object-record/multiple-objects/types/CombinedFindManyRecordsQueryResult';
import { generateCombinedSearchRecordsQuery } from '@/object-record/multiple-objects/utils/generateCombinedSearchRecordsQuery';
import { multipleRecordPickerPickableMorphItemsComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerPickableMorphItemsComponentState';
import { multipleRecordPickerSearchFilterComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerSearchFilterComponentState';
import { multipleRecordPickerSearchableObjectMetadataItemsComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerSearchableObjectMetadataItemsComponentState';
import { multipleRecordPickerformatQueryResultAsRecordsWithObjectMetadataId } from '@/object-record/record-picker/multiple-record-picker/utils/multipleRecordPickerformatQueryResultAsRecordWithObjectMetadataId';
import { RecordPickerPickableMorphItem } from '@/object-record/record-picker/types/RecordPickerPickableMorphItem';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useApolloClient } from '@apollo/client';
import { isNonEmptyArray } from '@sniptt/guards';
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
        forcePickedMorphItems = [],
      }: {
        multipleRecordPickerInstanceId: string;
        forceSearchFilter?: string;
        forceSearchableObjectMetadataItems?: ObjectMetadataItem[];
        forcePickedMorphItems?: RecordPickerPickableMorphItem[];
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

        const recordPickerPickableMorphItems = snapshot
          .getLoadable(
            multipleRecordPickerPickableMorphItemsComponentState.atomFamily({
              instanceId: multipleRecordPickerInstanceId,
            }),
          )
          .getValue();

        const pickedMorphItems =
          forcePickedMorphItems.length > 0
            ? forcePickedMorphItems
            : recordPickerPickableMorphItems;

        const pickedMorphItemsIds = pickedMorphItems.filter(
          ({ isSelected }) => isSelected,
        );

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

        const filterPerMetadataItemFilteredOnPickedRecordId =
          Object.fromEntries(
            searchableObjectMetadataItems
              .map(({ id, nameSingular }) => {
                const pickedRecordIdsForMetadataItem = pickedMorphItemsIds
                  .filter(({ objectMetadataId }) => objectMetadataId === id)
                  .map(({ recordId }) => recordId);

                if (!isNonEmptyArray(pickedRecordIdsForMetadataItem)) {
                  return null;
                }

                return [
                  `filter${capitalize(nameSingular)}`,
                  {
                    id: {
                      in: pickedRecordIdsForMetadataItem,
                    },
                  },
                ];
              })
              .filter(isDefined),
          );

        const filterPerMetadataItemExcludingPickedRecordId = Object.fromEntries(
          searchableObjectMetadataItems
            .map(({ id, nameSingular }) => {
              const pickedRecordIdsForMetadataItem = pickedMorphItemsIds
                .filter(({ objectMetadataId }) => objectMetadataId === id)
                .map(({ recordId }) => recordId);

              if (!isNonEmptyArray(pickedRecordIdsForMetadataItem)) {
                return null;
              }

              return [
                `filter${capitalize(nameSingular)}`,
                {
                  not: {
                    id: {
                      in: pickedRecordIdsForMetadataItem,
                    },
                  },
                },
              ];
            })
            .filter(isDefined),
        );

        const { data: combinedSearchRecordFilteredOnPickedRecordsQueryResult } =
          await client.query<CombinedFindManyRecordsQueryResult>({
            query: combinedSearchRecordsQuery,
            variables: {
              search: searchFilter,
              ...limitPerMetadataItem,
              ...filterPerMetadataItemFilteredOnPickedRecordId,
            },
          });

        const { data: combinedSearchRecordExcludingPickedRecordsQueryResult } =
          await client.query<CombinedFindManyRecordsQueryResult>({
            query: combinedSearchRecordsQuery,
            variables: {
              search: searchFilter,
              ...limitPerMetadataItem,
              ...filterPerMetadataItemExcludingPickedRecordId,
            },
          });

        const {
          recordsWithObjectMetadataId:
            recordsWithObjectMetadataIdFilteredOnPickedRecords,
        } = multipleRecordPickerformatQueryResultAsRecordsWithObjectMetadataId({
          objectMetadataItems: searchableObjectMetadataItems,
          searchQueryResult:
            combinedSearchRecordFilteredOnPickedRecordsQueryResult,
        });

        const {
          recordsWithObjectMetadataId:
            recordsWithObjectMetadataIdExcludingPickedRecords,
        } = multipleRecordPickerformatQueryResultAsRecordsWithObjectMetadataId({
          objectMetadataItems: searchableObjectMetadataItems,
          searchQueryResult:
            combinedSearchRecordExcludingPickedRecordsQueryResult,
        });

        const recordsWithObjectMetadataIdExcludingPickedRecordsWithoutDuplicates =
          recordsWithObjectMetadataIdExcludingPickedRecords.filter(
            ({ record }) =>
              !recordsWithObjectMetadataIdFilteredOnPickedRecords.some(
                ({ record: recordFilteredOnPickedRecords }) =>
                  recordFilteredOnPickedRecords.id === record.id,
              ),
          );

        const morphItems = [
          ...recordsWithObjectMetadataIdFilteredOnPickedRecords.map(
            ({ record, objectMetadataItem }) => ({
              isMatchingSearchFilter: true,
              isSelected: true,
              objectMetadataId: objectMetadataItem.id,
              recordId: record.id,
            }),
          ),
          ...recordsWithObjectMetadataIdExcludingPickedRecordsWithoutDuplicates.map(
            ({ record, objectMetadataItem }) => ({
              isMatchingSearchFilter: true,
              isSelected: false,
              objectMetadataId: objectMetadataItem.id,
              recordId: record.id,
            }),
          ),
        ];

        set(
          multipleRecordPickerPickableMorphItemsComponentState.atomFamily({
            instanceId: multipleRecordPickerInstanceId,
          }),
          morphItems,
        );

        [
          ...recordsWithObjectMetadataIdFilteredOnPickedRecords,
          ...recordsWithObjectMetadataIdExcludingPickedRecordsWithoutDuplicates,
        ].forEach(({ record }) => {
          set(recordStoreFamilyState(record.id), record);
        });
      },
    [client],
  );

  return { performSearch };
};
