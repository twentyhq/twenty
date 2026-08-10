import { useMemo } from 'react';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { useDebounce } from 'use-debounce';

import { useReadableObjectMetadataItems } from '@/object-metadata/hooks/useReadableObjectMetadataItems';
import { useObjectRecordSearchRecords } from '@/object-record/hooks/useObjectRecordSearchRecords';
import { SEARCH_RECORDS_DEBOUNCE_MS } from '@/search/constants/SearchRecordsDebounceMs';
import { type SearchResultItem } from '@/search/types/SearchResultItem';
import { useSearchableObjectNameSingulars } from '@/side-panel/hooks/useSearchableObjectNameSingulars';

type UseSearchRecordsParams = {
  searchInput: string;
  objectNameSingular: string | null;
  includeHiddenObjects?: boolean;
};

export const useSearchRecords = ({
  searchInput,
  objectNameSingular,
  includeHiddenObjects = false,
}: UseSearchRecordsParams) => {
  const [debouncedSearchInput] = useDebounce(
    searchInput.trim(),
    SEARCH_RECORDS_DEBOUNCE_MS,
  );

  const { readableObjectMetadataItems } = useReadableObjectMetadataItems();
  const includedObjectNameSingulars = useSearchableObjectNameSingulars({
    selectedObjectNameSingular: objectNameSingular,
    includeHiddenObjects,
  });

  const { loading, searchRecords } = useObjectRecordSearchRecords({
    objectNameSingulars: includedObjectNameSingulars,
    searchInput: debouncedSearchInput,
  });

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
      avatarType:
        searchRecord.objectNameSingular === CoreObjectNameSingular.Company
          ? ('squared' as const)
          : ('rounded' as const),
    }));
  }, [searchRecords, readableObjectMetadataItems]);

  return {
    loading,
    noResults: !searchResultItems.length,
    searchResultItems,
  };
};
