import { MAX_SEARCH_RESULTS } from '@/command-menu/constants/MaxSearchResults';
import { useReadableObjectMetadataItems } from '@/object-metadata/hooks/useReadableObjectMetadataItems';
import { sidePanelSearchObjectFilterState } from '@/side-panel/states/sidePanelSearchObjectFilterState';
import { sidePanelSearchState } from '@/side-panel/states/sidePanelSearchState';
import { sidePanelShowHiddenObjectsState } from '@/side-panel/states/sidePanelShowHiddenObjectsState';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useDebounce } from 'use-debounce';
import { useQuery } from '@apollo/client/react';
import { SearchDocument } from '~/generated/graphql';

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
  const sidePanelShowHiddenObjects = useAtomStateValue(
    sidePanelShowHiddenObjectsState,
  );
  const coreClient = useApolloCoreClient();

  const [deferredSidePanelSearch] = useDebounce(sidePanelSearch, 300);
  const { readableObjectMetadataItems } = useReadableObjectMetadataItems();

  const includedObjectNameSingulars = useMemo(() => {
    if (isDefined(sidePanelSearchObjectFilter)) {
      return [sidePanelSearchObjectFilter];
    }

    return readableObjectMetadataItems
      .filter((item) => sidePanelShowHiddenObjects || item.isSearchable)
      .map((item) => item.nameSingular);
  }, [
    readableObjectMetadataItems,
    sidePanelSearchObjectFilter,
    sidePanelShowHiddenObjects,
  ]);

  const { data: searchData, loading } = useQuery(SearchDocument, {
    client: coreClient,
    variables: {
      searchInput: deferredSidePanelSearch ?? '',
      limit: MAX_SEARCH_RESULTS,
      includedObjectNameSingulars,
    },
  });

  const searchResultItems: SearchResultItem[] = useMemo(() => {
    return (searchData?.search.edges.map((edge) => edge.node) ?? []).map(
      (searchRecord) => ({
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
      }),
    );
  }, [searchData, readableObjectMetadataItems]);

  return {
    loading,
    noResults: !searchResultItems.length,
    searchResultItems,
  };
};
