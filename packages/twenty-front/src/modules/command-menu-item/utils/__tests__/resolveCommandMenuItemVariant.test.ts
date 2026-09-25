import { type CommandMenuContextApi } from 'twenty-shared/types';

import { resolveCommandMenuItemVariant } from '@/command-menu-item/utils/resolveCommandMenuItemVariant';
import { CommandMenuItemVariant } from '~/generated-metadata/graphql';

const COMMAND_MENU_ITEM = {
  variant: CommandMenuItemVariant.SECONDARY,
  conditionalVariantExpression:
    'none(selectedRecords, "meetingLink.primaryLinkUrl") ? "PRIMARY" : "SECONDARY"',
};

const buildContextApi = (primaryLinkUrl: string) =>
  ({
    selectedRecords: [{ id: 'meeting-id', meetingLink: { primaryLinkUrl } }],
  }) as unknown as CommandMenuContextApi;

describe('resolveCommandMenuItemVariant', () => {
  it('promotes the item while the link is missing', () => {
    expect(
      resolveCommandMenuItemVariant(COMMAND_MENU_ITEM, buildContextApi(''))
        .variant,
    ).toBe(CommandMenuItemVariant.PRIMARY);
  });

  it('keeps the item secondary once the link is set', () => {
    expect(
      resolveCommandMenuItemVariant(
        COMMAND_MENU_ITEM,
        buildContextApi('https://meet.example.com/room'),
      ).variant,
    ).toBe(CommandMenuItemVariant.SECONDARY);
  });

  it('keeps the static variant without an expression', () => {
    const item = {
      variant: CommandMenuItemVariant.DISABLED,
      conditionalVariantExpression: null,
    };

    expect(
      resolveCommandMenuItemVariant(item, buildContextApi('')).variant,
    ).toBe(CommandMenuItemVariant.DISABLED);
  });
});
