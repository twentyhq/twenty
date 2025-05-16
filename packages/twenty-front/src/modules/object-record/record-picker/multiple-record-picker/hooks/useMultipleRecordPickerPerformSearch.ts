import { MAX_SEARCH_RESULTS } from '@/command-menu/constants/MaxSearchResults';
import { search } from '@/command-menu/graphql/queries/search';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { usePerformCombinedFindManyRecords } from '@/object-record/multiple-objects/hooks/usePerformCombinedFindManyRecords';
import { multipleRecordPickerPaginationState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerPaginationState';
import { multipleRecordPickerPickableMorphItemsComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerPickableMorphItemsComponentState';
import { multipleRecordPickerSearchFilterComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerSearchFilterComponentState';
import { multipleRecordPickerSearchableObjectMetadataItemsComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerSearchableObjectMetadataItemsComponentState';
import { searchRecordStoreComponentFamilyState } from '@/object-record/record-picker/multiple-record-picker/states/searchRecordStoreComponentFamilyState';
import { RecordPickerPickableMorphItem } from '@/object-record/record-picker/types/RecordPickerPickableMorphItem';
import { ApolloClient, useApolloClient } from '@apollo/client';
import { isNonEmptyArray } from '@sniptt/guards';
import { useRecoilCallback } from 'recoil';
import { capitalize, isDefined } from 'twenty-shared/utils';
import { SearchRecord } from '~/generated-metadata/graphql';

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
        loadMore = false,
      }: {
        multipleRecordPickerInstanceId: string;
        forceSearchFilter?: string;
        forceSearchableObjectMetadataItems?: ObjectMetadataItem[];
        forcePickableMorphItems?: RecordPickerPickableMorphItem[];
        loadMore?: boolean;
      }) => {
        const { getLoadable } = snapshot;

        const paginationState = getLoadable(
          multipleRecordPickerPaginationState.atomFamily({
            instanceId: multipleRecordPickerInstanceId,
          }),
        ).getValue();

        set(
          multipleRecordPickerPaginationState.atomFamily({
            instanceId: multipleRecordPickerInstanceId,
          }),
          {
            ...paginationState,
            currentOffset: loadMore ? paginationState.currentOffset : 0,
            hasMore: loadMore ? paginationState.hasMore : true,
            isLoadingMore: loadMore,
          },
        );

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
          offset: loadMore ? paginationState.currentOffset : 0,
          limit: paginationState.pageSize,
        });

        const existingMorphItems = loadMore
          ? getLoadable(
              multipleRecordPickerPickableMorphItemsComponentState.atomFamily({
                instanceId: multipleRecordPickerInstanceId,
              }),
            ).getValue()
          : [];

        const allPickedItems = [
          ...existingMorphItems.filter(({ isSelected }) => isSelected),
          ...pickableMorphItems.filter(({ isSelected }) => isSelected),
        ];

        const uniquePickedItems = allPickedItems.reduce(
          (acc, item) => {
            if (!acc.some((existing) => existing.recordId === item.recordId)) {
              acc.push(item);
            }
            return acc;
          },
          [] as typeof allPickedItems,
        );

        const updatedPickedItems = uniquePickedItems.map((morphItem) => {
          if (!searchFilter) {
            return {
              ...morphItem,
              isMatchingSearchFilter: true,
            };
          }

          const isMatchingSearchFilter =
            searchRecordsFilteredOnPickedRecords.some(
              ({ recordId }) => recordId === morphItem.recordId,
            ) ||
            searchRecordsExcludingPickedRecords.some(
              ({ recordId }) => recordId === morphItem.recordId,
            );

          return {
            ...morphItem,
            isMatchingSearchFilter,
          };
        });

        const updatedNonPickedExistingItems = existingMorphItems
          .filter((item) => !item.isSelected)
          .map((morphItem) => {
            if (!searchFilter) {
              return {
                ...morphItem,
                isMatchingSearchFilter: true,
              };
            }

            const isMatchingSearchFilter =
              searchRecordsFilteredOnPickedRecords.some(
                ({ recordId }) => recordId === morphItem.recordId,
              ) ||
              searchRecordsExcludingPickedRecords.some(
                ({ recordId }) => recordId === morphItem.recordId,
              );

            return {
              ...morphItem,
              isMatchingSearchFilter,
            };
          });

        const searchRecordsFilteredOnPickedRecordsWithoutDuplicates =
          searchRecordsFilteredOnPickedRecords.filter(
            (searchRecord) =>
              !updatedPickedItems.some(
                ({ recordId }) => recordId === searchRecord.recordId,
              ) &&
              !updatedNonPickedExistingItems.some(
                ({ recordId }) => recordId === searchRecord.recordId,
              ),
          );

        const searchRecordsExcludingPickedRecordsWithoutDuplicates =
          searchRecordsExcludingPickedRecords.filter(
            (searchRecord) =>
              !searchRecordsFilteredOnPickedRecords.some(
                ({ recordId }) => recordId === searchRecord.recordId,
              ) &&
              !updatedPickedItems.some(
                ({ recordId }) => recordId === searchRecord.recordId,
              ) &&
              !updatedNonPickedExistingItems.some(
                ({ recordId }) => recordId === searchRecord.recordId,
              ),
          );

        const newMorphItems = [
          ...updatedPickedItems,
          ...updatedNonPickedExistingItems,
          ...searchRecordsFilteredOnPickedRecordsWithoutDuplicates.map(
            ({ recordId, objectNameSingular }) => ({
              isMatchingSearchFilter: true,
              isSelected: true,
              objectMetadataId: searchableObjectMetadataItems.find(
                (objectMetadata) =>
                  objectMetadata.nameSingular === objectNameSingular,
              )?.id,
              recordId,
            }),
          ),
          ...searchRecordsExcludingPickedRecordsWithoutDuplicates.map(
            ({ recordId, objectNameSingular }) => ({
              isMatchingSearchFilter: true,
              isSelected: false,
              objectMetadataId: searchableObjectMetadataItems.find(
                (objectMetadata) =>
                  objectMetadata.nameSingular === objectNameSingular,
              )?.id,
              recordId,
            }),
          ),
        ];

        const morphItems = loadMore
          ? newMorphItems.reduce(
              (acc, item) => {
                if (
                  !acc.some((existing) => existing.recordId === item.recordId)
                ) {
                  acc.push(item);
                }
                return acc;
              },
              [] as typeof newMorphItems,
            )
          : newMorphItems;

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
                    ({ objectNameSingular }) =>
                      objectNameSingular === nameSingular,
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

        const hasMore =
          searchRecordsExcludingPickedRecords.length ===
          paginationState.pageSize;
        const newOffset = loadMore
          ? paginationState.currentOffset + paginationState.pageSize
          : paginationState.pageSize;

        set(
          multipleRecordPickerPaginationState.atomFamily({
            instanceId: multipleRecordPickerInstanceId,
          }),
          {
            ...paginationState,
            currentOffset: newOffset,
            hasMore,
            isLoadingMore: false,
          },
        );
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
  offset = 0,
  limit = MAX_SEARCH_RESULTS,
}: {
  client: ApolloClient<object>;
  searchFilter: string;
  searchableObjectMetadataItems: ObjectMetadataItem[];
  pickedRecordIds: string[];
  offset?: number;
  limit?: number;
}): Promise<[SearchRecord[], SearchRecord[]]> => {
  if (searchableObjectMetadataItems.length === 0) {
    return [[], []];
  }

  const searchRecords = async (filter: any) => {
    const { data } = await client.query({
      query: search,
      variables: {
        searchInput: searchFilter,
        includedObjectNameSingulars: searchableObjectMetadataItems.map(
          ({ nameSingular }) => nameSingular,
        ),
        filter,
        limit,
        offset,
      },
    });
    return data.search;
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
