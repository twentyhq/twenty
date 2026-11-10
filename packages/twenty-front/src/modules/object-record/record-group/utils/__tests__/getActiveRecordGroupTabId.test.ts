import { ALL_RECORD_GROUPS_TAB_ID } from '@/object-record/record-group/constants/AllRecordGroupsTabId';
import { getActiveRecordGroupTabId } from '@/object-record/record-group/utils/getActiveRecordGroupTabId';

describe('getActiveRecordGroupTabId', () => {
  it('should keep the selected group while it is visible', () => {
    expect(
      getActiveRecordGroupTabId({
        selectedRecordGroupId: 'replied',
        visibleRecordGroupIds: ['contacted', 'replied', 'meeting'],
      }),
    ).toBe('replied');
  });

  it('should fall back to the All tab when nothing is selected', () => {
    expect(
      getActiveRecordGroupTabId({
        selectedRecordGroupId: null,
        visibleRecordGroupIds: ['contacted', 'replied'],
      }),
    ).toBe(ALL_RECORD_GROUPS_TAB_ID);
  });

  it('should fall back to the All tab when the selected group was hidden', () => {
    expect(
      getActiveRecordGroupTabId({
        selectedRecordGroupId: 'not-now',
        visibleRecordGroupIds: ['contacted', 'replied'],
      }),
    ).toBe(ALL_RECORD_GROUPS_TAB_ID);
  });

  it('should keep the All tab when it is selected', () => {
    expect(
      getActiveRecordGroupTabId({
        selectedRecordGroupId: ALL_RECORD_GROUPS_TAB_ID,
        visibleRecordGroupIds: ['contacted', 'replied'],
      }),
    ).toBe(ALL_RECORD_GROUPS_TAB_ID);
  });
});
