import { getRightDrawerActionMenuDropdownIdFromActionMenuId } from '../getRightDrawerActionMenuDropdownIdFromActionMenuId';

describe('getRightDrawerActionMenuDropdownIdFromActionMenuId', () => {
  it('should return the right drawer action menu dropdown id', () => {
    expect(
      getRightDrawerActionMenuDropdownIdFromActionMenuId('action-menu-id'),
    ).toBe('right-drawer-action-menu-dropdown-action-menu-id');
  });
});
