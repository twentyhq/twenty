import { getActionMenuIdFromRecordIndexId } from '@/command-menu-item/utils/getActionMenuIdFromRecordIndexId';

describe('getActionMenuIdFromRecordIndexId', () => {
  it('should return the correct action menu id', () => {
    expect(getActionMenuIdFromRecordIndexId('record-index-id')).toBe(
      'action-menu-record-index-record-index-id',
    );
  });
});
