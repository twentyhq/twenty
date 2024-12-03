import { getActionMenuIdFromRecordIndexId } from '@/action-menu/utils/getActionMenuIdFromRecordIndexId';

describe('getActionMenuIdFromRecordIndexId', () => {
  it('should return the correct action menu id', () => {
    expect(getActionMenuIdFromRecordIndexId('record-index-id')).toBe(
      'action-menu-record-index-record-index-id',
    );
  });
});
