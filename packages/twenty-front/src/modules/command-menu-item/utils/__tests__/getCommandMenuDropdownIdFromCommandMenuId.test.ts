import { getCommandMenuDropdownIdFromCommandMenuId } from '@/command-menu-item/utils/getCommandMenuDropdownIdFromCommandMenuId';

describe('getCommandMenuDropdownIdFromCommandMenuId', () => {
  it('should return the correct action menu dropdown id', () => {
    expect(getCommandMenuDropdownIdFromCommandMenuId('action-menu-id')).toBe(
      'action-menu-dropdown-action-menu-id',
    );
  });
});
