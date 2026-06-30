import { useObjectRecordSearchRecords } from '@/object-record/hooks/useObjectRecordSearchRecords';
import { useReadableObjectMetadataItems } from '@/object-metadata/hooks/useReadableObjectMetadataItems';
import { useSearchableObjectNameSingulars } from '@/side-panel/hooks/useSearchableObjectNameSingulars';
import { sidePanelSearchObjectFilterState } from '@/side-panel/states/sidePanelSearchObjectFilterState';
import { sidePanelSearchState } from '@/side-panel/states/sidePanelSearchState';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useMemo } from 'react';
import { useDebounce } from 'use-debounce';

export type SearchResultItem = {
  id: string;
  label: string;
  objectNameSingular: string;
  recordId: string;
  imageUrl?: string | null;
  objectLabel: string;
  avatarType: 'squared' | 'rounded';
};

export type SearchResultGroup = {
  heading: string;
  items: SearchResultItem[];
};

export const useSidePanelSearchRecords = () => {
  const sidePanelSearch = useAtomStateValue(sidePanelSearchState);
  const sidePanelSearchObjectFilter = useAtomStateValue(
    sidePanelSearchObjectFilterState,
  );
  const trimmedSidePanelSearch = sidePanelSearch.trim();

  const [deferredSidePanelSearch] = useDebounce(trimmedSidePanelSearch, 300);
  const { readableObjectMetadataItems } = useReadableObjectMetadataItems();
  const includedObjectNameSingulars = useSearchableObjectNameSingulars({
    selectedObjectNameSingular: sidePanelSearchObjectFilter,
  });

  const { loading, searchRecords } = useObjectRecordSearchRecords({
    objectNameSingulars: includedObjectNameSingulars,
    searchInput: deferredSidePanelSearch,
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
