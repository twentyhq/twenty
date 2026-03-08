import { getSidePanelCommandMenuDropdownIdFromCommandMenuId } from '@/command-menu-item/utils/getSidePanelCommandMenuDropdownIdFromCommandMenuId';

describe('getSidePanelCommandMenuDropdownIdFromCommandMenuId', () => {
  it('should return the side panel action menu dropdown id', () => {
    expect(
      getSidePanelCommandMenuDropdownIdFromCommandMenuId('action-menu-id'),
    ).toBe('side-panel-action-menu-dropdown-action-menu-id');
  });
});
