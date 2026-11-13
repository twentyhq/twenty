import { RECORD_INDEX_ALL_TAB_ID } from '@/object-record/record-index-tab/constants/RecordIndexAllTabId';
import { getActiveRecordIndexTabId } from '@/object-record/record-index-tab/utils/getActiveRecordIndexTabId';

describe('getActiveRecordIndexTabId', () => {
  it('should keep the selected tab while its option exists', () => {
    expect(
      getActiveRecordIndexTabId({
        selectedRecordIndexTabId: 'REPLIED',
        recordIndexTabIds: ['CONTACTED', 'REPLIED', 'MEETING'],
      }),
    ).toBe('REPLIED');
  });

  it('should fall back to the first tab when nothing is selected', () => {
    expect(
      getActiveRecordIndexTabId({
        selectedRecordIndexTabId: null,
        recordIndexTabIds: ['CONTACTED', 'REPLIED'],
      }),
    ).toBe('CONTACTED');
  });

  it('should fall back to the first tab when the selected option was removed', () => {
    expect(
      getActiveRecordIndexTabId({
        selectedRecordIndexTabId: 'NOT_NOW',
        recordIndexTabIds: ['CONTACTED', 'REPLIED'],
      }),
    ).toBe('CONTACTED');
  });

  it('should keep the All tab when it is selected', () => {
    expect(
      getActiveRecordIndexTabId({
        selectedRecordIndexTabId: RECORD_INDEX_ALL_TAB_ID,
        recordIndexTabIds: ['CONTACTED', 'REPLIED', RECORD_INDEX_ALL_TAB_ID],
      }),
    ).toBe(RECORD_INDEX_ALL_TAB_ID);
  });

  it('should fall back to the first tab when the selected All tab is hidden', () => {
    expect(
      getActiveRecordIndexTabId({
        selectedRecordIndexTabId: RECORD_INDEX_ALL_TAB_ID,
        recordIndexTabIds: ['CONTACTED', 'REPLIED'],
      }),
    ).toBe('CONTACTED');
  });

  it('should fall back to the All tab when no tab is visible', () => {
    expect(
      getActiveRecordIndexTabId({
        selectedRecordIndexTabId: null,
        recordIndexTabIds: [],
      }),
    ).toBe(RECORD_INDEX_ALL_TAB_ID);
  });
});
