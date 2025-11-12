import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { DEFAULT_SEARCH_REQUEST_LIMIT } from '@/object-record/constants/DefaultSearchRequestLimit';
import { useObjectRecordSearchRecords } from '@/object-record/hooks/useObjectRecordSearchRecords';
import { searchRecordStoreFamilyState } from '@/object-record/record-picker/multiple-record-picker/states/searchRecordStoreComponentFamilyState';
import { SingleRecordPickerComponentInstanceContext } from '@/object-record/record-picker/single-record-picker/states/contexts/SingleRecordPickerComponentInstanceContext';
import { singleRecordPickerSearchableObjectMetadataItemsComponentState } from '@/object-record/record-picker/single-record-picker/states/singleRecordPickerSearchableObjectMetadataItemsComponentState';
import { type RecordPickerPickableMorphItem } from '@/object-record/record-picker/types/RecordPickerPickableMorphItem';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilCallback } from 'recoil';
import { CustomError, isDefined } from 'twenty-shared/utils';
import { type SearchQuery } from '~/generated/graphql';

export const useSingleRecordPickerPerformSearch = ({
  selectedIds,
  limit,
  excludedRecordIds = [],
  objectNameSingulars,
  searchFilter,
}: {
  selectedIds: string[];
  limit?: number;
  excludedRecordIds?: string[];
  objectNameSingulars: string[];
  searchFilter?: string;
}): {
  pickableMorphItems: RecordPickerPickableMorphItem[];
  loading: boolean;
} => {
  const singleRecordPickerInstanceId = useAvailableComponentInstanceIdOrThrow(
    SingleRecordPickerComponentInstanceContext,
  );

  const { objectMetadataItems } = useObjectMetadataItems();

  const onSearchRecordsCompleted = useRecoilCallback(
    ({ set }) =>
      (data: SearchQuery) => {
        const searchRecords = data.search.edges.map((edge) => edge.node);

        searchRecords.forEach((searchRecord) => {
          set(searchRecordStoreFamilyState(searchRecord.recordId), {
            ...searchRecord,
            record: undefined,
          });
        });

        set(
          singleRecordPickerSearchableObjectMetadataItemsComponentState.atomFamily(
            { instanceId: singleRecordPickerInstanceId },
          ),
          objectMetadataItems.filter((objectMetadataItem) =>
            objectNameSingulars.includes(objectMetadataItem.nameSingular),
          ),
        );
      },
    [objectMetadataItems, objectNameSingulars, singleRecordPickerInstanceId],
  );

  const selectedIdsFilter = { id: { in: selectedIds } };

  const { loading: selectedRecordsLoading, searchRecords: selectedRecords } =
    useObjectRecordSearchRecords({
      objectNameSingulars,
      filter: selectedIdsFilter,
      skip: !selectedIds.length,
      searchInput: '',
      onCompleted: onSearchRecordsCompleted,
    });

  const {
    loading: filteredSelectedRecordsLoading,
    searchRecords: filteredSelectedRecords,
  } = useObjectRecordSearchRecords({
    objectNameSingulars,
    filter: selectedIdsFilter,
    skip: !selectedIds.length,
    searchInput: searchFilter,
    onCompleted: onSearchRecordsCompleted,
  });

  const notFilterIds = [...selectedIds, ...excludedRecordIds];
  const notFilter = notFilterIds.length
    ? { not: { id: { in: notFilterIds } } }
    : undefined;
  const { loading: recordsToSelectLoading, searchRecords: recordsToSelect } =
    useObjectRecordSearchRecords({
      objectNameSingulars,
      filter: notFilter,
      limit: limit ?? DEFAULT_SEARCH_REQUEST_LIMIT,
      searchInput: searchFilter,
      fetchPolicy: 'cache-and-network',
      onCompleted: onSearchRecordsCompleted,
    });

  const pickableMorphItems = [...selectedRecords, ...recordsToSelect].map(
    (record) => {
      const objectMetadataItem = objectMetadataItems.find(
        (objectMetadataItem) =>
          objectMetadataItem.nameSingular === record.objectNameSingular,
      );

      if (!isDefined(objectMetadataItem)) {
        throw new CustomError(
          'Object metadata item not found for object name singular: ' +
            record.objectNameSingular,
          'OBJECT_METADATA_ITEM_NOT_FOUND',
        );
      }

      return {
        recordId: record.recordId,
        objectMetadataId: objectMetadataItem.id,
        isSelected: selectedRecords.some(
          (selectedRecord) => selectedRecord.recordId === record.recordId,
        ),
        isMatchingSearchFilter:
          recordsToSelect.some(
            (recordsToSelectRecord) =>
              recordsToSelectRecord.recordId === record.recordId,
          ) ||
          filteredSelectedRecords.some(
            (filteredSelectedRecord) =>
              filteredSelectedRecord.recordId === record.recordId,
          ),
      };
    },
  );

  return {
    pickableMorphItems,
    loading:
      recordsToSelectLoading ||
      filteredSelectedRecordsLoading ||
      selectedRecordsLoading,
  };
};
