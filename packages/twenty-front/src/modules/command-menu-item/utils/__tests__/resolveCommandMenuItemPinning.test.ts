import {
  type ConditionalDisplay,
  ViewFilterOperand,
} from 'twenty-shared/types';

import { resolveCommandMenuItemPinning } from '@/command-menu-item/utils/resolveCommandMenuItemPinning';
import { type ConditionalDisplayEvaluationContext } from '@/conditional-display/types/ConditionalDisplayEvaluationContext';

const STATUS_IS_SENT: ConditionalDisplay = {
  recordFilters: [
    {
      id: 'status-is-sent',
      contextKey: 'selectedRecords',
      subFieldName: 'status',
      operand: ViewFilterOperand.IS,
      value: JSON.stringify('SENT'),
    },
  ],
};

const COMMAND_MENU_ITEM = {
  isPinned: true,
  conditionalPinned: STATUS_IS_SENT,
};

const buildContext = (status: string): ConditionalDisplayEvaluationContext => ({
  selectedRecords: [{ id: 'campaign-id', status }],
});

const resolvePinning = (
  commandMenuItem: {
    isPinned: boolean;
    conditionalPinned: ConditionalDisplay | null;
  },
  status: string,
) =>
  resolveCommandMenuItemPinning({
    commandMenuItem,
    conditionalDisplayContext: buildContext(status),
    objectMetadataItems: [],
  });

describe('resolveCommandMenuItemPinning', () => {
  it('keeps the pin while the pinned condition holds', () => {
    expect(resolvePinning(COMMAND_MENU_ITEM, 'SENT').isPinned).toBe(true);
  });

  it('unpins without hiding when the pinned condition fails', () => {
    expect(resolvePinning(COMMAND_MENU_ITEM, 'DRAFT').isPinned).toBe(false);
  });

  it('leaves an item without a pinned condition alone', () => {
    const item = { ...COMMAND_MENU_ITEM, conditionalPinned: null };

    expect(resolvePinning(item, 'DRAFT').isPinned).toBe(true);
  });

  it('never pins an item that is not pinned to begin with', () => {
    const item = { ...COMMAND_MENU_ITEM, isPinned: false };

    expect(resolvePinning(item, 'SENT').isPinned).toBe(false);
  });
});
