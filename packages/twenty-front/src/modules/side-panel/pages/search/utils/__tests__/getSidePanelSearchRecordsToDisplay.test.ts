import { getSidePanelSearchRecordsToDisplay } from '@/side-panel/pages/search/utils/getSidePanelSearchRecordsToDisplay';

describe('getSidePanelSearchRecordsToDisplay', () => {
  it('displays settled search records and allows keeping them for the next search', () => {
    expect(
      getSidePanelSearchRecordsToDisplay({
        searchRecords: ['acme'],
        isLoading: false,
        isSearchSkipped: false,
        canDisplayPreviousSearchRecords: false,
      }),
    ).toEqual({
      canDisplayPreviousSearchRecords: true,
      searchRecordsToDisplay: ['acme'],
    });
  });

  it('keeps previous search records while the next search is loading', () => {
    expect(
      getSidePanelSearchRecordsToDisplay({
        searchRecords: ['acme'],
        isLoading: true,
        isSearchSkipped: false,
        canDisplayPreviousSearchRecords: true,
      }),
    ).toEqual({
      canDisplayPreviousSearchRecords: true,
      searchRecordsToDisplay: ['acme'],
    });
  });

  it('forgets previous search records once the search is skipped', () => {
    expect(
      getSidePanelSearchRecordsToDisplay({
        searchRecords: [],
        isLoading: false,
        isSearchSkipped: true,
        canDisplayPreviousSearchRecords: true,
      }),
    ).toEqual({
      canDisplayPreviousSearchRecords: false,
      searchRecordsToDisplay: [],
    });
  });

  it('hides search records from before a skipped search while the next search is loading', () => {
    expect(
      getSidePanelSearchRecordsToDisplay({
        searchRecords: ['acme'],
        isLoading: true,
        isSearchSkipped: false,
        canDisplayPreviousSearchRecords: false,
      }),
    ).toEqual({
      canDisplayPreviousSearchRecords: false,
      searchRecordsToDisplay: [],
    });
  });
});
