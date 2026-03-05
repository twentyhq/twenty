import { getSidePanelActionMenuDropdownIdFromActionMenuId } from '@/action-menu/utils/getSidePanelActionMenuDropdownIdFromActionMenuId';

describe('getSidePanelActionMenuDropdownIdFromActionMenuId', () => {
  it('should return the side panel action menu dropdown id', () => {
    expect(
      getSidePanelActionMenuDropdownIdFromActionMenuId('action-menu-id'),
    ).toBe('side-panel-action-menu-dropdown-action-menu-id');
  });
});
