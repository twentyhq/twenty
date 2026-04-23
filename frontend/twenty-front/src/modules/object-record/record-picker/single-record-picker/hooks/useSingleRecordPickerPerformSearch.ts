import { useEffect, useMemo } from 'react';
import { useStore } from 'jotai';

import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { DEFAULT_SEARCH_REQUEST_LIMIT } from '@/object-record/constants/DefaultSearchRequestLimit';
import { useObjectRecordSearchRecords } from '@/object-record/hooks/useObjectRecordSearchRecords';
import { searchRecordStoreFamilyState } from '@/object-record/record-picker/multiple-record-picker/states/searchRecordStoreComponentFamilyState';
import { SingleRecordPickerComponentInstanceContext } from '@/object-record/record-picker/single-record-picker/states/contexts/SingleRecordPickerComponentInstanceContext';
import { singleRecordPickerSearchableObjectMetadataItemsComponentState } from '@/object-record/record-picker/single-record-picker/states/singleRecordPickerSearchableObjectMetadataItemsComponentState';
import { type RecordPickerPickableMorphItem } from '@/object-record/record-picker/types/RecordPickerPickableMorphItem';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { CustomError, isDefined } from 'twenty-shared/utils';

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
  const store = useStore();
  const singleRecordPickerInstanceId = useAvailableComponentInstanceIdOrThrow(
    SingleRecordPickerComponentInstanceContext,
  );

  const { objectMetadataItems } = useObjectMetadataItems();

  const hasSelectedIds = selectedIds.length > 0;
  const selectedIdsFilter = hasSelectedIds
    ? { id: { in: selectedIds } }
    : undefined;

  const { loading: selectedRecordsLoading, searchRecords: selectedRecords } =
    useObjectRecordSearchRecords({
      objectNameSingulars,
      filter: selectedIdsFilter,
      skip: !hasSelectedIds,
      searchInput: '',
    });

  const {
    loading: filteredSelectedRecordsLoading,
    searchRecords: filteredSelectedRecords,
  } = useObjectRecordSearchRecords({
    objectNameSingulars,
    filter: selectedIdsFilter,
    skip: !hasSelectedIds,
    searchInput: searchFilter,
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
    });

  const allSearchRecords = useMemo(
    () => [...selectedRecords, ...filteredSelectedRecords, ...recordsToSelect],
    [selectedRecords, filteredSelectedRecords, recordsToSelect],
  );

  // TODO: Refactor this useEffect to avoid unnecessary re-renders (see PR #18584 review)
  useEffect(() => {
    allSearchRecords.forEach((searchRecord) => {
      store.set(
        searchRecordStoreFamilyState.atomFamily(searchRecord.recordId),
        {
          ...searchRecord,
          record: undefined,
        },
      );
    });

    store.set(
      singleRecordPickerSearchableObjectMetadataItemsComponentState.atomFamily({
        instanceId: singleRecordPickerInstanceId,
      }),
      objectMetadataItems.filter((objectMetadataItem) =>
        objectNameSingulars.includes(objectMetadataItem.nameSingular),
      ),
    );
  }, [
    allSearchRecords,
    store,
    objectMetadataItems,
    objectNameSingulars,
    singleRecordPickerInstanceId,
  ]);

  const pickableMorphItems = [...selectedRecords, ...recordsToSelect]
    .filter(isDefined)
    .map((record) => {
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
          (selectedRecord) => selectedRecord?.recordId === record.recordId,
        ),
        isMatchingSearchFilter:
          recordsToSelect.some(
            (recordsToSelectRecord) =>
              recordsToSelectRecord?.recordId === record.recordId,
          ) ||
          filteredSelectedRecords.some(
            (filteredSelectedRecord) =>
              filteredSelectedRecord?.recordId === record.recordId,
          ),
      };
    });

  return {
    pickableMorphItems,
    loading:
      recordsToSelectLoading ||
      filteredSelectedRecordsLoading ||
      selectedRecordsLoading,
  };
};
