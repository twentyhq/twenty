import { getSidePanelCommandMenuDropdownIdFromCommandMenuId } from '@/command-menu-item/utils/getSidePanelCommandMenuDropdownIdFromCommandMenuId';

describe('getSidePanelCommandMenuDropdownIdFromCommandMenuId', () => {
  it('should return the side panel command menu dropdown id', () => {
    expect(
      getSidePanelCommandMenuDropdownIdFromCommandMenuId('command-menu-id'),
    ).toBe('side-panel-command-menu-dropdown-command-menu-id');
  });
});
