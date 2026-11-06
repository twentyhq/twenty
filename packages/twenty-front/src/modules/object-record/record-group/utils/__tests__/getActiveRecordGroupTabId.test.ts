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

  it('should fall back to the first visible group when nothing is selected', () => {
    expect(
      getActiveRecordGroupTabId({
        selectedRecordGroupId: null,
        visibleRecordGroupIds: ['contacted', 'replied'],
      }),
    ).toBe('contacted');
  });

  it('should fall back to the first visible group when the selected one was hidden', () => {
    expect(
      getActiveRecordGroupTabId({
        selectedRecordGroupId: 'not-now',
        visibleRecordGroupIds: ['contacted', 'replied'],
      }),
    ).toBe('contacted');
  });

  it('should return null when no group is visible', () => {
    expect(
      getActiveRecordGroupTabId({
        selectedRecordGroupId: 'replied',
        visibleRecordGroupIds: [],
      }),
    ).toBeNull();
  });
});
