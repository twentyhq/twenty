import { COMMAND_MENU_INLINE_SEARCH_RECORDS_LIMIT } from '@/command-menu-item/constants/CommandMenuInlineSearchRecordsLimit';
import { type SearchResultItem } from '@/side-panel/pages/search/types/SearchResultItem';

export const getCommandMenuInlineSearchRecordRows = ({
  searchResultItems,
  isInlineRecordSearchActive,
  isSearchingRecords,
}: {
  searchResultItems: SearchResultItem[];
  isInlineRecordSearchActive: boolean;
  isSearchingRecords: boolean;
}) => {
  if (!isInlineRecordSearchActive) {
    return {
      inlineSearchResultItems: [],
      hasMoreSearchResultItems: false,
      shouldDisplayNoRecordsFound: false,
      isRecordSearchFallbackRedundant: false,
    };
  }

  const hasMoreSearchResultItems =
    !isSearchingRecords &&
    searchResultItems.length > COMMAND_MENU_INLINE_SEARCH_RECORDS_LIMIT;

  const shouldDisplayNoRecordsFound =
    !isSearchingRecords && searchResultItems.length === 0;

  return {
    inlineSearchResultItems: searchResultItems.slice(
      0,
      COMMAND_MENU_INLINE_SEARCH_RECORDS_LIMIT,
    ),
    hasMoreSearchResultItems,
    shouldDisplayNoRecordsFound,
    isRecordSearchFallbackRedundant:
      isSearchingRecords ||
      hasMoreSearchResultItems ||
      shouldDisplayNoRecordsFound,
  };
};
