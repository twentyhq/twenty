import { getCommandMenuIdFromRecordIndexId } from '@/command-menu-item/utils/getCommandMenuIdFromRecordIndexId';

describe('getCommandMenuIdFromRecordIndexId', () => {
  it('should return the correct command menu id', () => {
    expect(getCommandMenuIdFromRecordIndexId('record-index-id')).toBe(
      'command-menu-record-index-record-index-id',
    );
  });
});
