import { getActionMenuDropdownIdFromActionMenuId } from '@/command-menu-item/utils/getActionMenuDropdownIdFromActionMenuId';

describe('getActionMenuDropdownIdFromActionMenuId', () => {
  it('should return the correct action menu dropdown id', () => {
    expect(getActionMenuDropdownIdFromActionMenuId('action-menu-id')).toBe(
      'action-menu-dropdown-action-menu-id',
    );
  });
});
