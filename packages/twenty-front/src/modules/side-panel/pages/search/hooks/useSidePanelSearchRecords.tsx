import { type SearchResultItem } from '@/side-panel/pages/search/types/SearchResultItem';
import { useObjectRecordSearchRecords } from '@/object-record/hooks/useObjectRecordSearchRecords';
import { useReadableObjectMetadataItems } from '@/object-metadata/hooks/useReadableObjectMetadataItems';
import { useSearchableObjectNameSingulars } from '@/side-panel/hooks/useSearchableObjectNameSingulars';
import { sidePanelSearchObjectFilterState } from '@/side-panel/states/sidePanelSearchObjectFilterState';
import { sidePanelSearchState } from '@/side-panel/states/sidePanelSearchState';
import { StandardObjectNameSingular } from 'twenty-shared/types';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useMemo } from 'react';
import { useDebounce } from 'use-debounce';
import { isNonEmptyString } from '@sniptt/guards';

type UseSidePanelSearchRecordsParams = {
  shouldSkip?: boolean;
  shouldSkipEmptySearch?: boolean;
  shouldIgnoreObjectFilter?: boolean;
  limit?: number;
};

export const useSidePanelSearchRecords = ({
  shouldSkip = false,
  shouldSkipEmptySearch = false,
  shouldIgnoreObjectFilter = false,
  limit,
}: UseSidePanelSearchRecordsParams = {}) => {
  const sidePanelSearch = useAtomStateValue(sidePanelSearchState);
  const sidePanelSearchObjectFilter = useAtomStateValue(
    sidePanelSearchObjectFilterState,
  );
  const trimmedSidePanelSearch = sidePanelSearch.trim();

  const [deferredSidePanelSearch] = useDebounce(trimmedSidePanelSearch, 300);
  const { readableObjectMetadataItems } = useReadableObjectMetadataItems();
  const includedObjectNameSingulars = useSearchableObjectNameSingulars({
    selectedObjectNameSingular: shouldIgnoreObjectFilter
      ? null
      : sidePanelSearchObjectFilter,
  });

  const hasNoSearchableObject = includedObjectNameSingulars.length === 0;

  const isSkippedEmptySearch =
    shouldSkipEmptySearch &&
    (!isNonEmptyString(trimmedSidePanelSearch) ||
      !isNonEmptyString(deferredSidePanelSearch));

  const { loading, searchRecords, error } = useObjectRecordSearchRecords({
    objectNameSingulars: includedObjectNameSingulars,
    searchInput: deferredSidePanelSearch,
    limit,
    skip: shouldSkip || hasNoSearchableObject || isSkippedEmptySearch,
  });

  const isWaitingForDebouncedSearch =
    deferredSidePanelSearch !== trimmedSidePanelSearch;

  const searchResultItems: SearchResultItem[] = useMemo(() => {
    return searchRecords.map((searchRecord) => ({
      id: searchRecord.recordId,
      label: searchRecord.label,
      objectNameSingular: searchRecord.objectNameSingular,
      recordId: searchRecord.recordId,
      imageUrl: searchRecord.imageUrl,
      objectLabel:
        readableObjectMetadataItems.find(
          (item) => item.nameSingular === searchRecord.objectNameSingular,
        )?.labelSingular ?? searchRecord.objectNameSingular,
      avatarShape:
        searchRecord.objectNameSingular === StandardObjectNameSingular.Company
          ? ('square' as const)
          : ('circle' as const),
    }));
  }, [searchRecords, readableObjectMetadataItems]);

  return {
    error,
    loading,
    isWaitingForDebouncedSearch,
    noResults: !searchResultItems.length,
    searchResultItems,
  };
};
