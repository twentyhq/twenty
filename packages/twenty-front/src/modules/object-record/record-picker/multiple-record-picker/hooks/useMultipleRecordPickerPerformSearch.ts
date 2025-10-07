import { SEARCH_QUERY } from '@/command-menu/graphql/queries/search';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { usePerformCombinedFindManyRecords } from '@/object-record/multiple-objects/hooks/usePerformCombinedFindManyRecords';
import { multipleRecordPickerIsLoadingComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerIsLoadingComponentState';
import { multipleRecordPickerPaginationState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerPaginationState';
import { multipleRecordPickerPickableMorphItemsComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerPickableMorphItemsComponentState';
import { multipleRecordPickerSearchFilterComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerSearchFilterComponentState';
import { multipleRecordPickerSearchableObjectMetadataItemsComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerSearchableObjectMetadataItemsComponentState';
import { searchRecordStoreFamilyState } from '@/object-record/record-picker/multiple-record-picker/states/searchRecordStoreComponentFamilyState';
import { sortMorphItems } from '@/object-record/record-picker/multiple-record-picker/utils/sortMorphItems';
import { type RecordPickerPickableMorphItem } from '@/object-record/record-picker/types/RecordPickerPickableMorphItem';
import { getObjectPermissionsFromMapByObjectMetadataId } from '@/settings/roles/role-permissions/objects-permissions/utils/getObjectPermissionsFromMapByObjectMetadataId';
import { type ApolloClient } from '@apollo/client';
import { isNonEmptyArray } from '@sniptt/guards';
import { useRecoilCallback } from 'recoil';
import { capitalize, isDefined } from 'twenty-shared/utils';
import { type SearchRecord } from '~/generated-metadata/graphql';
import { type SearchResultEdge } from '~/generated/graphql';

const MULTIPLE_RECORD_PICKER_PAGE_SIZE = 30;

export const useMultipleRecordPickerPerformSearch = () => {
  const apolloCoreClient = useApolloCoreClient();

  const { performCombinedFindManyRecords } =
    usePerformCombinedFindManyRecords();

  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();

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
          multipleRecordPickerIsLoadingComponentState.atomFamily({
            instanceId: multipleRecordPickerInstanceId,
          }),
          true,
        );

        set(
          multipleRecordPickerPaginationState.atomFamily({
            instanceId: multipleRecordPickerInstanceId,
          }),
          {
            ...paginationState,
            endCursor: loadMore ? paginationState.endCursor : null,
            hasNextPage: loadMore ? paginationState.hasNextPage : true,
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

        const filteredSearchableObjectMetadataItems =
          searchableObjectMetadataItems.filter(
            (objectMetadataItem) =>
              getObjectPermissionsFromMapByObjectMetadataId({
                objectPermissionsByObjectMetadataId,
                objectMetadataId: objectMetadataItem.id,
              }).canReadObjectRecords === true,
          );

        const [
          searchRecordsFilteredOnPickedRecords,
          searchRecordsExcludingPickedRecords,
          pageInfo,
        ] = await performSearchQueries({
          client: apolloCoreClient,
          searchFilter,
          searchableObjectMetadataItems: filteredSearchableObjectMetadataItems,
          pickedRecordIds: selectedPickableMorphItems.map(
            ({ recordId }) => recordId,
          ),
          after: loadMore ? paginationState.endCursor : null,
        });

        const existingMorphItems = getLoadable(
          multipleRecordPickerPickableMorphItemsComponentState.atomFamily({
            instanceId: multipleRecordPickerInstanceId,
          }),
        ).getValue();

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
              objectMetadataId:
                searchableObjectMetadataItems.find(
                  (objectMetadata) =>
                    objectMetadata.nameSingular === objectNameSingular,
                )?.id ?? '',
              recordId,
            }),
          ),
          ...searchRecordsExcludingPickedRecordsWithoutDuplicates.map(
            ({ recordId, objectNameSingular }) => ({
              isMatchingSearchFilter: true,
              isSelected: false,
              objectMetadataId:
                searchableObjectMetadataItems.find(
                  (objectMetadata) =>
                    objectMetadata.nameSingular === objectNameSingular,
                )?.id ?? '',
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

        const sortedMorphItems = sortMorphItems(morphItems, [
          ...searchRecordsFilteredOnPickedRecords,
          ...searchRecordsExcludingPickedRecords,
        ]);

        set(
          multipleRecordPickerPickableMorphItemsComponentState.atomFamily({
            instanceId: multipleRecordPickerInstanceId,
          }),
          sortedMorphItems,
        );

        const searchRecords = [
          ...searchRecordsFilteredOnPickedRecords,
          ...searchRecordsExcludingPickedRecordsWithoutDuplicates,
        ];

        searchRecords.forEach((searchRecord) => {
          set(
            searchRecordStoreFamilyState(searchRecord.recordId),
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

                  set(searchRecordStoreFamilyState(objectRecord.id), {
                    ...searchRecord,
                    record: objectRecord,
                  });
                });
            },
          );
        }

        set(
          multipleRecordPickerPaginationState.atomFamily({
            instanceId: multipleRecordPickerInstanceId,
          }),
          {
            ...paginationState,
            endCursor: pageInfo.endCursor,
            hasNextPage: pageInfo.hasNextPage,
          },
        );

        set(
          multipleRecordPickerIsLoadingComponentState.atomFamily({
            instanceId: multipleRecordPickerInstanceId,
          }),
          false,
        );
      },
    [
      apolloCoreClient,
      performCombinedFindManyRecords,
      objectPermissionsByObjectMetadataId,
    ],
  );

  return { performSearch };
};

const performSearchQueries = async ({
  client,
  searchFilter,
  searchableObjectMetadataItems,
  pickedRecordIds,
  limit = MULTIPLE_RECORD_PICKER_PAGE_SIZE,
  after = null,
}: {
  client: ApolloClient<object>;
  searchFilter: string;
  searchableObjectMetadataItems: ObjectMetadataItem[];
  pickedRecordIds: string[];
  limit?: number;
  after?: string | null;
}): Promise<
  [
    SearchRecord[],
    SearchRecord[],
    { hasNextPage: boolean; endCursor: string | null },
  ]
> => {
  if (searchableObjectMetadataItems.length === 0) {
    return [[], [], { hasNextPage: false, endCursor: null }];
  }

  const searchRecords = async (filter: any) => {
    const { data } = await client.query({
      query: SEARCH_QUERY,
      variables: {
        searchInput: searchFilter,
        includedObjectNameSingulars: searchableObjectMetadataItems.map(
          ({ nameSingular }) => nameSingular,
        ),
        filter,
        limit,
        after,
      },
    });
    return {
      records: data.search.edges.map((edge: SearchResultEdge) => edge.node),
      pageInfo: data.search.pageInfo,
    };
  };

  const searchRecordsExcludingPickedRecordsResult = await searchRecords(
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

  const searchRecordsIncludingPickedRecordsResult =
    pickedRecordIds.length > 0
      ? await searchRecords({
          id: {
            in: pickedRecordIds,
          },
        })
      : { records: [], pageInfo: { hasNextPage: false, endCursor: null } };

  return [
    searchRecordsIncludingPickedRecordsResult.records,
    searchRecordsExcludingPickedRecordsResult.records,
    searchRecordsExcludingPickedRecordsResult.pageInfo,
  ];
};
