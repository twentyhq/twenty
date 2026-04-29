import { getCommandMenuDropdownIdFromCommandMenuId } from '@/command-menu-item/utils/getCommandMenuDropdownIdFromCommandMenuId';

describe('getCommandMenuDropdownIdFromCommandMenuId', () => {
  it('should return the correct command menu dropdown id', () => {
    expect(getCommandMenuDropdownIdFromCommandMenuId('command-menu-id')).toBe(
      'command-menu-dropdown-command-menu-id',
    );
  });
});
