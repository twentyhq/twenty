import { getActionBarIdFromActionMenuId } from '@/action-menu/utils/getActionBarIdFromActionMenuId';

describe('getActionBarIdFromActionMenuId', () => {
  it('should return the correct action bar id', () => {
    expect(getActionBarIdFromActionMenuId('action-menu-id')).toBe(
      'action-bar-action-menu-id',
    );
  });
});
