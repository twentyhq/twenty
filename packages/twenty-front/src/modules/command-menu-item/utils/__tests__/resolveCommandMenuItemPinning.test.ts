import { type CommandMenuContextApi } from 'twenty-shared/types';

import { resolveCommandMenuItemPinning } from '@/command-menu-item/utils/resolveCommandMenuItemPinning';

const COMMAND_MENU_ITEM = {
  isPinned: true,
  conditionalPinnedExpression: 'everyEquals(selectedRecords, "status", "SENT")',
};

const buildContextApi = (status: string) =>
  ({
    selectedRecords: [{ id: 'campaign-id', status }],
  }) as unknown as CommandMenuContextApi;

describe('resolveCommandMenuItemPinning', () => {
  it('keeps the pin while the expression holds', () => {
    expect(
      resolveCommandMenuItemPinning(COMMAND_MENU_ITEM, buildContextApi('SENT'))
        .isPinned,
    ).toBe(true);
  });

  it('unpins without hiding when the expression fails', () => {
    expect(
      resolveCommandMenuItemPinning(COMMAND_MENU_ITEM, buildContextApi('DRAFT'))
        .isPinned,
    ).toBe(false);
  });

  it('leaves an item without an expression alone', () => {
    const item = { ...COMMAND_MENU_ITEM, conditionalPinnedExpression: null };

    expect(
      resolveCommandMenuItemPinning(item, buildContextApi('DRAFT')).isPinned,
    ).toBe(true);
  });

  it('never pins an item that is not pinned to begin with', () => {
    const item = { ...COMMAND_MENU_ITEM, isPinned: false };

    expect(
      resolveCommandMenuItemPinning(item, buildContextApi('SENT')).isPinned,
    ).toBe(false);
  });
});
