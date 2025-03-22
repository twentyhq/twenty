import { MAX_SEARCH_RESULTS } from '@/command-menu/constants/MaxSearchResults';
import { globalSearch } from '@/command-menu/graphql/queries/globalSearch';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { usePerformCombinedFindManyRecords } from '@/object-record/multiple-objects/hooks/usePerformCombinedFindManyRecords';
import { multipleRecordPickerPickableMorphItemsComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerPickableMorphItemsComponentState';
import { multipleRecordPickerSearchFilterComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerSearchFilterComponentState';
import { multipleRecordPickerSearchableObjectMetadataItemsComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerSearchableObjectMetadataItemsComponentState';
import { searchRecordStoreComponentFamilyState } from '@/object-record/record-picker/multiple-record-picker/states/searchRecordStoreComponentFamilyState';
import { RecordPickerPickableMorphItem } from '@/object-record/record-picker/types/RecordPickerPickableMorphItem';
import { ApolloClient, useApolloClient } from '@apollo/client';
import { isNonEmptyArray } from '@sniptt/guards';
import { useRecoilCallback } from 'recoil';
import { capitalize, isDefined } from 'twenty-shared';
import { GlobalSearchRecord } from '~/generated-metadata/graphql';

export const useMultipleRecordPickerPerformSearch = () => {
  const client = useApolloClient();

  const { performCombinedFindManyRecords } =
    usePerformCombinedFindManyRecords();

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
        const { getLoadable } = snapshot;

        const recordPickerSearchFilter = getLoadable(
          multipleRecordPickerSearchFilterComponentState.atomFamily({
            instanceId: multipleRecordPickerInstanceId,
          }),
        ).getValue();

        const searchFilter = forceSearchFilter ?? recordPickerSearchFilter;

        const recordPickerSearchableObjectMetadataItems = getLoadable(
          multipleRecordPickerSearchableObjectMetadataItemsComponentState.atomFamily(
            { instanceId: multipleRecordPickerInstanceId },
          ),
        ).getValue();

        const searchableObjectMetadataItems =
          forceSearchableObjectMetadataItems.length > 0
            ? forceSearchableObjectMetadataItems
            : recordPickerSearchableObjectMetadataItems;

        const recordPickerPickableMorphItems = getLoadable(
          multipleRecordPickerPickableMorphItemsComponentState.atomFamily({
            instanceId: multipleRecordPickerInstanceId,
          }),
        ).getValue();

        const pickableMorphItems =
          forcePickableMorphItems.length > 0
            ? forcePickableMorphItems
            : recordPickerPickableMorphItems;
        const selectedPickableMorphItems = pickableMorphItems.filter(
          ({ isSelected }) => isSelected,
        );

        const [
          searchRecordsFilteredOnPickedRecords,
          searchRecordsExcludingPickedRecords,
        ] = await performSearchQueries({
          client,
          searchFilter,
          searchableObjectMetadataItems,
          pickedRecordIds: selectedPickableMorphItems.map(
            ({ recordId }) => recordId,
          ),
        });

        const pickedMorphItems = pickableMorphItems.filter(
          ({ isSelected }) => isSelected,
        );

        // We update the existing pickedMorphItems to be matching the search filter
        const updatedPickedMorphItems = pickedMorphItems.map((morphItem) => {
          const record = searchRecordsFilteredOnPickedRecords.find(
            ({ recordId }) => recordId === morphItem.recordId,
          );

          return {
            ...morphItem,
            isMatchingSearchFilter: isDefined(record),
          };
        });

        const searchRecordsFilteredOnPickedRecordsWithoutDuplicates =
          searchRecordsFilteredOnPickedRecords.filter(
            (searchRecord) =>
              !updatedPickedMorphItems.some(
                ({ recordId }) => recordId === searchRecord.recordId,
              ),
          );

        const searchRecordsExcludingPickedRecordsWithoutDuplicates =
          searchRecordsExcludingPickedRecords.filter(
            (searchRecord) =>
              !searchRecordsFilteredOnPickedRecords.some(
                ({ recordId }) => recordId === searchRecord.recordId,
              ) &&
              !pickedMorphItems.some(
                ({ recordId }) => recordId === searchRecord.recordId,
              ),
          );

        const morphItems = [
          ...updatedPickedMorphItems,
          ...searchRecordsFilteredOnPickedRecordsWithoutDuplicates.map(
            ({ recordId, objectSingularName }) => ({
              isMatchingSearchFilter: true,
              isSelected: true,
              objectMetadataId: searchableObjectMetadataItems.find(
                (objectMetadata) =>
                  objectMetadata.nameSingular === objectSingularName,
              )?.id,
              recordId,
            }),
          ),
          ...searchRecordsExcludingPickedRecordsWithoutDuplicates.map(
            ({ recordId, objectSingularName }) => ({
              isMatchingSearchFilter: true,
              isSelected: false,
              objectMetadataId: searchableObjectMetadataItems.find(
                (objectMetadata) =>
                  objectMetadata.nameSingular === objectSingularName,
              )?.id,
              recordId,
            }),
          ),
        ];

        set(
          multipleRecordPickerPickableMorphItemsComponentState.atomFamily({
            instanceId: multipleRecordPickerInstanceId,
          }),
          morphItems,
        );

        const searchRecords = [
          ...searchRecordsFilteredOnPickedRecords,
          ...searchRecordsExcludingPickedRecordsWithoutDuplicates,
        ];

        searchRecords.forEach((searchRecord) => {
          set(
            searchRecordStoreComponentFamilyState.atomFamily({
              instanceId: multipleRecordPickerInstanceId,
              familyKey: searchRecord.recordId,
            }),
            searchRecord,
          );
        });

        if (searchRecords.length > 0) {
          const filterPerMetadataItemFilteredOnRecordId = Object.fromEntries(
            searchableObjectMetadataItems
              .map(({ nameSingular }) => {
                const recordIdsForMetadataItem = searchRecords
                  .filter(
                    ({ objectSingularName }) =>
                      objectSingularName === nameSingular,
                  )
                  .map(({ recordId }) => recordId);

                if (!isNonEmptyArray(recordIdsForMetadataItem)) {
                  return null;
                }

                return [
                  `filter${capitalize(nameSingular)}`,
                  {
                    id: {
                      in: recordIdsForMetadataItem,
                    },
                  },
                ];
              })
              .filter(isDefined),
          );

          const operationSignatures = searchableObjectMetadataItems
            .filter(({ nameSingular }) =>
              isDefined(
                filterPerMetadataItemFilteredOnRecordId[
                  `filter${capitalize(nameSingular)}`
                ],
              ),
            )
            .map((objectMetadataItem) => ({
              objectNameSingular: objectMetadataItem.nameSingular,
              variables: {
                filter:
                  filterPerMetadataItemFilteredOnRecordId[
                    `filter${capitalize(objectMetadataItem.nameSingular)}`
                  ],
              },
            }));

          performCombinedFindManyRecords({ operationSignatures }).then(
            ({ result }) => {
              Object.values(result)
                .flat()
                .forEach((objectRecord) => {
                  const searchRecord = searchRecords.find(
                    ({ recordId }) => recordId === objectRecord.id,
                  );

                  if (!searchRecord) {
                    return;
                  }

                  set(
                    searchRecordStoreComponentFamilyState.atomFamily({
                      instanceId: multipleRecordPickerInstanceId,
                      familyKey: objectRecord.id,
                    }),
                    {
                      ...searchRecord,
                      record: objectRecord,
                    },
                  );
                });
            },
          );
        }
      },
    [client, performCombinedFindManyRecords],
  );

  return { performSearch };
};

const performSearchQueries = async ({
  client,
  searchFilter,
  searchableObjectMetadataItems,
  pickedRecordIds,
}: {
  client: ApolloClient<object>;
  searchFilter: string;
  searchableObjectMetadataItems: ObjectMetadataItem[];
  pickedRecordIds: string[];
}): Promise<[GlobalSearchRecord[], GlobalSearchRecord[]]> => {
  if (searchableObjectMetadataItems.length === 0) {
    return [[], []];
  }

  const searchRecords = async (filter: any) => {
    const { data } = await client.query({
      query: globalSearch,
      variables: {
        searchInput: searchFilter,
        includedObjectNameSingulars: searchableObjectMetadataItems.map(
          ({ nameSingular }) => nameSingular,
        ),
        filter,
        limit: MAX_SEARCH_RESULTS,
      },
    });
    return data.globalSearch;
  };

  const searchRecordsExcludingPickedRecords = await searchRecords(
    pickedRecordIds.length > 0
      ? {
          not: {
            id: {
              in: pickedRecordIds,
            },
          },
        }
      : undefined,
  );

  const searchRecordsIncludingPickedRecords =
    pickedRecordIds.length > 0
      ? await searchRecords({
          id: {
            in: pickedRecordIds,
          },
        })
      : [];

  return [
    searchRecordsIncludingPickedRecords,
    searchRecordsExcludingPickedRecords,
  ];
};
