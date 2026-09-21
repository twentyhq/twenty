import { type SearchResultItem } from '@/side-panel/pages/search/types/SearchResultItem';
import { getSearchResultItemShowPagePath } from '@/side-panel/pages/search/utils/getSearchResultItemShowPagePath';
import { useIsWorkflowCoreEnabled } from '@/workflow/hooks/useIsWorkflowCoreEnabled';
import { useObjectRecordSearchRecords } from '@/object-record/hooks/useObjectRecordSearchRecords';
import { useReadableObjectMetadataItems } from '@/object-metadata/hooks/useReadableObjectMetadataItems';
import { useSearchableObjectNameSingulars } from '@/side-panel/hooks/useSearchableObjectNameSingulars';
import { sidePanelSearchObjectFilterState } from '@/side-panel/states/sidePanelSearchObjectFilterState';
import { sidePanelSearchState } from '@/side-panel/states/sidePanelSearchState';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useDebounce } from 'use-debounce';

export const useSidePanelSearchRecords = () => {
  const sidePanelSearch = useAtomStateValue(sidePanelSearchState);
  const sidePanelSearchObjectFilter = useAtomStateValue(
    sidePanelSearchObjectFilterState,
  );
  const isWorkflowCoreEnabled = useIsWorkflowCoreEnabled();
  const trimmedSidePanelSearch = sidePanelSearch.trim();

  const [deferredSidePanelSearch] = useDebounce(trimmedSidePanelSearch, 300);
  const { readableObjectMetadataItems } = useReadableObjectMetadataItems();
  const includedObjectNameSingulars = useSearchableObjectNameSingulars({
    selectedObjectNameSingular: sidePanelSearchObjectFilter,
  });

  const { loading, searchRecords, error } = useObjectRecordSearchRecords({
    objectNameSingulars: includedObjectNameSingulars,
    searchInput: deferredSidePanelSearch,
  });

  const searchResultItems: SearchResultItem[] = useMemo(() => {
    return searchRecords.flatMap((searchRecord) => {
      const showPagePath = getSearchResultItemShowPagePath({
        objectNameSingular: searchRecord.objectNameSingular,
        recordId: searchRecord.recordId,
        coreWorkflowId: searchRecord.coreWorkflowId,
        isWorkflowCoreEnabled,
      });

      if (!isDefined(showPagePath)) {
        return [];
      }

      return [
        {
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
            searchRecord.objectNameSingular === CoreObjectNameSingular.Company
              ? ('square' as const)
              : ('circle' as const),
          showPagePath,
        },
      ];
    });
  }, [searchRecords, readableObjectMetadataItems, isWorkflowCoreEnabled]);

  return {
    error,
    loading,
    noResults: !searchResultItems.length,
    searchResultItems,
  };
};
