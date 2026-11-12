import { type CommandMenuContextApi } from 'twenty-shared/types';

import { EMPTY_COMMAND_MENU_CONTEXT_API } from '@/command-menu-item/constants/EmptyCommandMenuContextApi';
import { resolveCommandMenuItemPinning } from '@/command-menu-item/utils/resolveCommandMenuItemPinning';

const COMMAND_MENU_ITEM = {
  isPinned: true,
  conditionalPinnedExpression: 'everyEquals(selectedRecords, "status", "SENT")',
};

const buildContextApi = (status: string): CommandMenuContextApi => ({
  ...EMPTY_COMMAND_MENU_CONTEXT_API,
  selectedRecords: [{ id: 'campaign-id', status }],
});

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

  it('pins on the targeted view only', () => {
    const item = {
      isPinned: true,
      conditionalPinnedExpression:
        "currentView.universalIdentifier == 'agencies-view'",
    };
    const buildViewContextApi = (
      universalIdentifier: string,
    ): CommandMenuContextApi => ({
      ...EMPTY_COMMAND_MENU_CONTEXT_API,
      currentView: { id: 'view-id', universalIdentifier },
    });

    expect(
      resolveCommandMenuItemPinning(item, buildViewContextApi('agencies-view'))
        .isPinned,
    ).toBe(true);
    expect(
      resolveCommandMenuItemPinning(item, buildViewContextApi('all-companies'))
        .isPinned,
    ).toBe(false);
  });
});
