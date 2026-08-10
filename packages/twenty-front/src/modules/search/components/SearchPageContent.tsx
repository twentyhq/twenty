import { styled } from '@linaria/react';
import { useMemo } from 'react';
import { useIsMobile } from 'twenty-ui/utilities';

import { SearchPageHeader } from '@/search/components/SearchPageHeader';
import { SearchPageObjectFilterList } from '@/search/components/SearchPageObjectFilterList';
import { SearchPagePreview } from '@/search/components/SearchPagePreview';
import { SearchPageResults } from '@/search/components/SearchPageResults';
import { SEARCH_PAGE_SELECTABLE_LIST_ID } from '@/search/constants/SearchPageSelectableListId';
import { useOpenSearchResultItem } from '@/search/hooks/useOpenSearchResultItem';
import { useSearchFilterableObjectMetadataItems } from '@/search/hooks/useSearchFilterableObjectMetadataItems';
import { useSearchPageQueryParams } from '@/search/hooks/useSearchPageQueryParams';
import { useSearchRecordPreviewItem } from '@/search/hooks/useSearchRecordPreviewItem';
import { useSearchRecords } from '@/search/hooks/useSearchRecords';
import { getValidSearchObjectNameSingular } from '@/search/utils/getValidSearchObjectNameSingular';

const StyledBody = styled.div`
  display: flex;
  flex: 1;
  flex-direction: row;
  min-height: 0;
`;

export const SearchPageContent = () => {
  const isMobile = useIsMobile();

  const {
    searchInput,
    objectNameSingular,
    setSearchInput,
    setObjectNameSingular,
  } = useSearchPageQueryParams();

  const filterableObjectMetadataItems =
    useSearchFilterableObjectMetadataItems();

  const selectedObjectNameSingular = getValidSearchObjectNameSingular({
    objectNameSingular,
    filterableObjectMetadataItems,
  });

  const { searchResultItems, loading, noResults } = useSearchRecords({
    searchInput,
    objectNameSingular: selectedObjectNameSingular,
  });

  const selectableItemIds = useMemo(
    () => searchResultItems.map((item) => item.id),
    [searchResultItems],
  );

  const previewedItem = useSearchRecordPreviewItem({
    searchResultItems,
    selectableListInstanceId: SEARCH_PAGE_SELECTABLE_LIST_ID,
  });

  const { openSearchResultItem } = useOpenSearchResultItem();

  return (
    <>
      <SearchPageHeader
        searchInput={searchInput}
        onSearchInputChange={setSearchInput}
        selectedObjectNameSingular={selectedObjectNameSingular}
        onSelectObject={setObjectNameSingular}
      />
      <StyledBody>
        {!isMobile && (
          <SearchPageObjectFilterList
            objectMetadataItems={filterableObjectMetadataItems}
            selectedObjectNameSingular={selectedObjectNameSingular}
            onSelectObject={setObjectNameSingular}
          />
        )}
        <SearchPageResults
          searchResultItems={searchResultItems}
          selectableItemIds={selectableItemIds}
          loading={loading}
          noResults={noResults}
          onItemClick={openSearchResultItem}
        />
        {!isMobile && <SearchPagePreview previewedItem={previewedItem} />}
      </StyledBody>
    </>
  );
};
