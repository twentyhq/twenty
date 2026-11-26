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
      shouldDisplaySeeInSearchResults: false,
      shouldDisplaySearchingRecords: false,
      shouldDisplayNoRecordsFound: false,
    });
  });

  it('caps record rows and links to the search results', () => {
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
      shouldDisplaySeeInSearchResults: true,
      shouldDisplaySearchingRecords: false,
      shouldDisplayNoRecordsFound: false,
    });
  });

  it('links to the search results when settled results fit in the rows', () => {
    const searchResultItems = buildSearchResultItems(2);

    expect(
      getCommandMenuInlineSearchRecordRows({
        searchResultItems,
        isInlineRecordSearchActive: true,
        isSearchingRecords: false,
      }),
    ).toEqual({
      inlineSearchResultItems: searchResultItems,
      shouldDisplaySeeInSearchResults: true,
      shouldDisplaySearchingRecords: false,
      shouldDisplayNoRecordsFound: false,
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
      shouldDisplaySeeInSearchResults: false,
      shouldDisplaySearchingRecords: false,
      shouldDisplayNoRecordsFound: true,
    });
  });

  it('displays searching records until the first results arrive', () => {
    expect(
      getCommandMenuInlineSearchRecordRows({
        searchResultItems: [],
        isInlineRecordSearchActive: true,
        isSearchingRecords: true,
      }),
    ).toEqual({
      inlineSearchResultItems: [],
      shouldDisplaySeeInSearchResults: false,
      shouldDisplaySearchingRecords: true,
      shouldDisplayNoRecordsFound: false,
    });
  });

  it('keeps previous record rows without the footer while searching', () => {
    const searchResultItems = buildSearchResultItems(2);

    expect(
      getCommandMenuInlineSearchRecordRows({
        searchResultItems,
        isInlineRecordSearchActive: true,
        isSearchingRecords: true,
      }),
    ).toEqual({
      inlineSearchResultItems: searchResultItems,
      shouldDisplaySeeInSearchResults: false,
      shouldDisplaySearchingRecords: false,
      shouldDisplayNoRecordsFound: false,
    });
  });
});
