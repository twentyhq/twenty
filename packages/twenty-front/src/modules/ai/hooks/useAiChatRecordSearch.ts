import { useState } from 'react';
import { isNonEmptyArray } from 'twenty-shared/utils';
import { useDebounce } from 'use-debounce';

import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { useObjectRecordSearchRecords } from '@/object-record/hooks/useObjectRecordSearchRecords';

export const useAiChatRecordSearch = (
  objectMetadataItems: EnrichedObjectMetadataItem[],
) => {
  const [search, setSearch] = useState('');
  const trimmedSearch = search.trim();
  const [debouncedSearch] = useDebounce(trimmedSearch, 300);

  const { searchRecords, loading } = useObjectRecordSearchRecords({
    objectNameSingulars: objectMetadataItems.map(
      ({ nameSingular }) => nameSingular,
    ),
    searchInput: debouncedSearch,
    skip: !isNonEmptyArray(objectMetadataItems),
  });
  const areSearchRecordsStale = loading || debouncedSearch !== trimmedSearch;

  const objectMetadataItemByNameSingular = new Map(
    objectMetadataItems.map((objectMetadataItem) => [
      objectMetadataItem.nameSingular,
      objectMetadataItem,
    ]),
  );

  return {
    search,
    setSearch,
    trimmedSearch,
    searchRecords,
    loading,
    areSearchRecordsStale,
    objectMetadataItemByNameSingular,
  };
};
