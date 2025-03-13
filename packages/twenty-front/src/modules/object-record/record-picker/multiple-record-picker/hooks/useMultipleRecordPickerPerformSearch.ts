import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { CombinedFindManyRecordsQueryResult } from '@/object-record/multiple-objects/types/CombinedFindManyRecordsQueryResult';
import { generateCombinedSearchRecordsQuery } from '@/object-record/multiple-objects/utils/generateCombinedSearchRecordsQuery';
import { getLimitPerMetadataItem } from '@/object-record/multiple-objects/utils/getLimitPerMetadataItem';
import { multipleRecordPickerPickableMorphItemsComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerPickableMorphItemsComponentState';
import { multipleRecordPickerSearchFilterComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerSearchFilterComponentState';
import { multipleRecordPickerSearchableObjectMetadataItemsComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerSearchableObjectMetadataItemsComponentState';
import { multipleRecordPickerformatQueryResultAsRecordsWithObjectMetadataId } from '@/object-record/record-picker/multiple-record-picker/utils/multipleRecordPickerformatQueryResultAsRecordWithObjectMetadataId';
import { RecordPickerPickableMorphItem } from '@/object-record/record-picker/types/RecordPickerPickableMorphItem';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { ApolloClient, useApolloClient } from '@apollo/client';
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
        forcePickableMorphItems = [],
      }: {
        multipleRecordPickerInstanceId: string;
        forceSearchFilter?: string;
        forceSearchableObjectMetadataItems?: ObjectMetadataItem[];
        forcePickableMorphItems?: RecordPickerPickableMorphItem[];
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

        const pickableMorphItems =
          forcePickableMorphItems.length > 0
            ? forcePickableMorphItems
            : recordPickerPickableMorphItems;

        const recordsWithObjectMetadataIdFilteredOnPickedRecords =
          await performSearchForPickedRecords({
            client,
            searchFilter,
            searchableObjectMetadataItems,
            pickableMorphItems,
          });

        const recordsWithObjectMetadataIdExcludingPickedRecords =
          await performSearchExcludingPickedRecords({
            client,
            searchFilter,
            searchableObjectMetadataItems,
            pickableMorphItems,
          });

        const pickedMorphItems = pickableMorphItems.filter(
          ({ isSelected }) => isSelected,
        );

        // We update the existing pickedMorphItems to be matching the search filter
        const updatedPickedMorphItems = pickedMorphItems.map((morphItem) => {
          const record =
            recordsWithObjectMetadataIdFilteredOnPickedRecords.find(
              ({ record }) => record.id === morphItem.recordId,
            );

          return {
            ...morphItem,
            isMatchingSearchFilter: isDefined(record),
          };
        });

        const recordsWithObjectMetadataIdFilteredOnPickedRecordsWithoutDuplicates =
          recordsWithObjectMetadataIdFilteredOnPickedRecords.filter(
            ({ record }) =>
              !updatedPickedMorphItems.some(
                ({ recordId }) => recordId === record.id,
              ),
          );

        const recordsWithObjectMetadataIdExcludingPickedRecordsWithoutDuplicates =
          recordsWithObjectMetadataIdExcludingPickedRecords.filter(
            ({ record }) =>
              !recordsWithObjectMetadataIdFilteredOnPickedRecords.some(
                ({ record: recordFilteredOnPickedRecords }) =>
                  recordFilteredOnPickedRecords.id === record.id,
              ) &&
              !pickedMorphItems.some(({ recordId }) => recordId === record.id),
          );

        const morphItems = [
          ...updatedPickedMorphItems,
          ...recordsWithObjectMetadataIdFilteredOnPickedRecordsWithoutDuplicates.map(
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

const performSearchForPickedRecords = async ({
  client,
  searchFilter,
  searchableObjectMetadataItems,
  pickableMorphItems,
}: {
  client: ApolloClient<object>;
  searchFilter: string;
  searchableObjectMetadataItems: ObjectMetadataItem[];
  pickableMorphItems: RecordPickerPickableMorphItem[];
}) => {
  const pickedMorphItems = pickableMorphItems.filter(
    ({ isSelected }) => isSelected,
  );

  const filterPerMetadataItemFilteredOnPickedRecordId = Object.fromEntries(
    searchableObjectMetadataItems
      .map(({ id, nameSingular }) => {
        const pickedRecordIdsForMetadataItem = pickedMorphItems
          .filter(
            ({ objectMetadataId, isSelected }) =>
              objectMetadataId === id && isSelected,
          )
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

  const searchableObjectMetadataItemsFilteredOnPickedRecordId =
    searchableObjectMetadataItems.filter(({ nameSingular }) =>
      isDefined(
        filterPerMetadataItemFilteredOnPickedRecordId[
          `filter${capitalize(nameSingular)}`
        ],
      ),
    );

  if (!isNonEmptyArray(searchableObjectMetadataItemsFilteredOnPickedRecordId)) {
    return [];
  }

  const combinedSearchRecordsQueryFilteredOnPickedRecords =
    generateCombinedSearchRecordsQuery({
      objectMetadataItems:
        searchableObjectMetadataItemsFilteredOnPickedRecordId,
      operationSignatures:
        searchableObjectMetadataItemsFilteredOnPickedRecordId.map(
          (objectMetadataItem) => ({
            objectNameSingular: objectMetadataItem.nameSingular,
            variables: {},
          }),
        ),
    });

  const limitPerMetadataItem = getLimitPerMetadataItem(
    searchableObjectMetadataItemsFilteredOnPickedRecordId,
    10,
  );

  const { data: combinedSearchRecordFilteredOnPickedRecordsQueryResult } =
    await client.query<CombinedFindManyRecordsQueryResult>({
      query: combinedSearchRecordsQueryFilteredOnPickedRecords,
      variables: {
        search: searchFilter,
        ...limitPerMetadataItem,
        ...filterPerMetadataItemFilteredOnPickedRecordId,
      },
    });

  const {
    recordsWithObjectMetadataId:
      recordsWithObjectMetadataIdFilteredOnPickedRecords,
  } = multipleRecordPickerformatQueryResultAsRecordsWithObjectMetadataId({
    objectMetadataItems: searchableObjectMetadataItems,
    searchQueryResult: combinedSearchRecordFilteredOnPickedRecordsQueryResult,
  });

  return recordsWithObjectMetadataIdFilteredOnPickedRecords;
};

const performSearchExcludingPickedRecords = async ({
  client,
  searchFilter,
  searchableObjectMetadataItems,
  pickableMorphItems,
}: {
  client: ApolloClient<object>;
  searchFilter: string;
  searchableObjectMetadataItems: ObjectMetadataItem[];
  pickableMorphItems: RecordPickerPickableMorphItem[];
}) => {
  if (searchableObjectMetadataItems.length === 0) {
    return [];
  }

  const pickedMorphItems = pickableMorphItems.filter(
    ({ isSelected }) => isSelected,
  );

  const filterPerMetadataItemExcludingPickedRecordId = Object.fromEntries(
    searchableObjectMetadataItems
      .map(({ id, nameSingular }) => {
        const pickedRecordIdsForMetadataItem = pickedMorphItems
          .filter(
            ({ objectMetadataId, isSelected }) =>
              objectMetadataId === id && isSelected,
          )
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

  const combinedSearchRecordsQueryExcludingPickedRecords =
    generateCombinedSearchRecordsQuery({
      objectMetadataItems: searchableObjectMetadataItems,
      operationSignatures: searchableObjectMetadataItems.map(
        (objectMetadataItem) => ({
          objectNameSingular: objectMetadataItem.nameSingular,
          variables: {},
        }),
      ),
    });

  const limitPerMetadataItem = getLimitPerMetadataItem(
    searchableObjectMetadataItems,
    10,
  );

  const { data: combinedSearchRecordExcludingPickedRecordsQueryResult } =
    await client.query<CombinedFindManyRecordsQueryResult>({
      query: combinedSearchRecordsQueryExcludingPickedRecords,
      variables: {
        search: searchFilter,
        ...limitPerMetadataItem,
        ...filterPerMetadataItemExcludingPickedRecordId,
      },
    });

  const {
    recordsWithObjectMetadataId:
      recordsWithObjectMetadataIdExcludingPickedRecords,
  } = multipleRecordPickerformatQueryResultAsRecordsWithObjectMetadataId({
    objectMetadataItems: searchableObjectMetadataItems,
    searchQueryResult: combinedSearchRecordExcludingPickedRecordsQueryResult,
  });

  return recordsWithObjectMetadataIdExcludingPickedRecords;
};
