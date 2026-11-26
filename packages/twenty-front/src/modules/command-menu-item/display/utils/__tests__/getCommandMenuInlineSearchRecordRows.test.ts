import { COMMAND_MENU_INLINE_SEARCH_RECORDS_LIMIT } from '@/command-menu-item/constants/CommandMenuInlineSearchRecordsLimit';
import { getCommandMenuInlineSearchRecordRows } from '@/command-menu-item/display/utils/getCommandMenuInlineSearchRecordRows';
import { type SearchResultItem } from '@/side-panel/pages/search/types/SearchResultItem';

const buildSearchResultItems = (count: number): SearchResultItem[] =>
  Array.from({ length: count }, (_, index) => ({
    id: `record-${index}`,
    label: `Record ${index}`,
    objectNameSingular: 'company',
    recordId: `record-${index}`,
    objectLabel: 'Company',
    avatarShape: 'square',
  }));

describe('getCommandMenuInlineSearchRecordRows', () => {
  it('displays no record rows when inline record search is inactive', () => {
    expect(
      getCommandMenuInlineSearchRecordRows({
        searchResultItems: buildSearchResultItems(3),
        isInlineRecordSearchActive: false,
        isSearchingRecords: false,
      }),
    ).toEqual({
      inlineSearchResultItems: [],
      hasMoreSearchResultItems: false,
      shouldDisplayNoRecordsFound: false,
      isRecordSearchFallbackRedundant: false,
    });
  });

  it('caps record rows and offers more results once the search settles', () => {
    const searchResultItems = buildSearchResultItems(
      COMMAND_MENU_INLINE_SEARCH_RECORDS_LIMIT + 1,
    );

    expect(
      getCommandMenuInlineSearchRecordRows({
        searchResultItems,
        isInlineRecordSearchActive: true,
        isSearchingRecords: false,
      }),
    ).toEqual({
      inlineSearchResultItems: searchResultItems.slice(
        0,
        COMMAND_MENU_INLINE_SEARCH_RECORDS_LIMIT,
      ),
      hasMoreSearchResultItems: true,
      shouldDisplayNoRecordsFound: false,
      isRecordSearchFallbackRedundant: true,
    });
  });

  it('displays no records found once the search settles without results', () => {
    expect(
      getCommandMenuInlineSearchRecordRows({
        searchResultItems: [],
        isInlineRecordSearchActive: true,
        isSearchingRecords: false,
      }),
    ).toEqual({
      inlineSearchResultItems: [],
      hasMoreSearchResultItems: false,
      shouldDisplayNoRecordsFound: true,
      isRecordSearchFallbackRedundant: true,
    });
  });

  it('keeps the record search fallback when settled results fit in the rows', () => {
    const searchResultItems = buildSearchResultItems(2);

    expect(
      getCommandMenuInlineSearchRecordRows({
        searchResultItems,
        isInlineRecordSearchActive: true,
        isSearchingRecords: false,
      }),
    ).toEqual({
      inlineSearchResultItems: searchResultItems,
      hasMoreSearchResultItems: false,
      shouldDisplayNoRecordsFound: false,
      isRecordSearchFallbackRedundant: false,
    });
  });

  it('keeps previous record rows without footer rows while searching', () => {
    const searchResultItems = buildSearchResultItems(
      COMMAND_MENU_INLINE_SEARCH_RECORDS_LIMIT + 1,
    );

    expect(
      getCommandMenuInlineSearchRecordRows({
        searchResultItems,
        isInlineRecordSearchActive: true,
        isSearchingRecords: true,
      }),
    ).toEqual({
      inlineSearchResultItems: searchResultItems.slice(
        0,
        COMMAND_MENU_INLINE_SEARCH_RECORDS_LIMIT,
      ),
      hasMoreSearchResultItems: false,
      shouldDisplayNoRecordsFound: false,
      isRecordSearchFallbackRedundant: true,
    });
  });

  it('keeps the record search fallback while searching when previous rows fit', () => {
    const searchResultItems = buildSearchResultItems(2);

    expect(
      getCommandMenuInlineSearchRecordRows({
        searchResultItems,
        isInlineRecordSearchActive: true,
        isSearchingRecords: true,
      }),
    ).toEqual({
      inlineSearchResultItems: searchResultItems,
      hasMoreSearchResultItems: false,
      shouldDisplayNoRecordsFound: false,
      isRecordSearchFallbackRedundant: false,
    });
  });
});
