import { isNonEmptyString } from '@sniptt/guards';
import { useMemo } from 'react';
import { useDebounce } from 'use-debounce';

import { useNavigationMenuItemEditController } from '@/navigation-menu-item/edit/hooks/useNavigationMenuItemEditController';
import { useObjectRecordSearchRecords } from '@/object-record/hooks/useObjectRecordSearchRecords';
import { useSearchableObjectNameSingulars } from '@/side-panel/hooks/useSearchableObjectNameSingulars';
import { isDefined } from 'twenty-shared/utils';

type NavigationMenuItemSearchRecord = {
  recordId: string;
  objectNameSingular: string;
  label: string;
  imageUrl?: string | null;
};

type UseAvailableNavigationMenuItemSearchRecordsParams = {
  searchInput: string;
  selectedObjectNameSingular?: string | null;
  skip?: boolean;
};

export const useAvailableNavigationMenuItemSearchRecords = ({
  searchInput,
  selectedObjectNameSingular = null,
  skip = false,
}: UseAvailableNavigationMenuItemSearchRecordsParams) => {
  const { currentItems } = useNavigationMenuItemEditController();
  const trimmedSearchInput = searchInput.trim();

  const [deferredSearchInput] = useDebounce(trimmedSearchInput, 300);

  const includedObjectNameSingulars = useSearchableObjectNameSingulars({
    selectedObjectNameSingular,
  });

  const {
    loading: recordSearchLoading,
    searchRecords,
    error,
  } = useObjectRecordSearchRecords({
    objectNameSingulars: includedObjectNameSingulars,
    searchInput: deferredSearchInput,
    skip: skip || !isNonEmptyString(deferredSearchInput),
  });

  const recordIdsAlreadyAdded = useMemo(
    () =>
      new Set(
        currentItems.flatMap((item) =>
          isDefined(item.targetRecordId) ? [item.targetRecordId] : [],
        ),
      ),
    [currentItems],
  );

  const availableSearchRecords = useMemo(
    () =>
      searchRecords
        .filter((record) => !recordIdsAlreadyAdded.has(record.recordId))
        .map(
          (record): NavigationMenuItemSearchRecord => ({
            recordId: record.recordId,
            objectNameSingular: record.objectNameSingular,
            label: record.label,
            imageUrl: record.imageUrl,
          }),
        ),
    [recordIdsAlreadyAdded, searchRecords],
  );

  return {
    error,
    availableSearchRecords,
    deferredSearchInput,
    isSearchDebouncing: trimmedSearchInput !== deferredSearchInput,
    recordSearchLoading,
    trimmedSearchInput,
  };
};
