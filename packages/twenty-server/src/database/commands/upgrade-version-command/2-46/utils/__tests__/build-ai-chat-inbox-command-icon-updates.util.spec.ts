import { buildAiChatInboxCommandIconUpdates } from 'src/database/commands/upgrade-version-command/2-46/utils/build-ai-chat-inbox-command-icon-updates.util';
import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { STANDARD_COMMAND_MENU_ITEMS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-command-menu-item.constant';

const NOW = '2026-10-08T00:00:00.000Z';

const { universalIdentifier: MARK_AS_DONE_UNIVERSAL_IDENTIFIER } =
  STANDARD_COMMAND_MENU_ITEMS.markAiChatAsDone;

const { universalIdentifier: UNSNOOZE_UNIVERSAL_IDENTIFIER } =
  STANDARD_COMMAND_MENU_ITEMS.unsnoozeAiChat;

const { universalIdentifier: SNOOZE_UNIVERSAL_IDENTIFIER } =
  STANDARD_COMMAND_MENU_ITEMS.snoozeAiChat;

const buildExistingItem = (
  universalIdentifier: string,
  icon: string | null,
): FlatCommandMenuItem =>
  ({
    universalIdentifier,
    icon,
    updatedAt: '2025-01-01T00:00:00.000Z',
  }) as FlatCommandMenuItem;

describe('buildAiChatInboxCommandIconUpdates', () => {
  it('moves the snooze and done commands to their new icons', () => {
    const updates = buildAiChatInboxCommandIconUpdates({
      flatCommandMenuItemByUniversalIdentifier: {
        [MARK_AS_DONE_UNIVERSAL_IDENTIFIER]: buildExistingItem(
          MARK_AS_DONE_UNIVERSAL_IDENTIFIER,
          'IconProgressCheck',
        ),
        [UNSNOOZE_UNIVERSAL_IDENTIFIER]: buildExistingItem(
          UNSNOOZE_UNIVERSAL_IDENTIFIER,
          'IconClockOff',
        ),
        [SNOOZE_UNIVERSAL_IDENTIFIER]: buildExistingItem(
          SNOOZE_UNIVERSAL_IDENTIFIER,
          'IconClock',
        ),
      },
      direction: 'up',
      now: NOW,
    });

    expect(updates).toEqual([
      expect.objectContaining({
        universalIdentifier: MARK_AS_DONE_UNIVERSAL_IDENTIFIER,
        icon: STANDARD_COMMAND_MENU_ITEMS.markAiChatAsDone.icon,
        updatedAt: NOW,
      }),
      expect.objectContaining({
        universalIdentifier: UNSNOOZE_UNIVERSAL_IDENTIFIER,
        icon: STANDARD_COMMAND_MENU_ITEMS.unsnoozeAiChat.icon,
        updatedAt: NOW,
      }),
      expect.objectContaining({
        universalIdentifier: SNOOZE_UNIVERSAL_IDENTIFIER,
        icon: STANDARD_COMMAND_MENU_ITEMS.snoozeAiChat.icon,
        updatedAt: NOW,
      }),
    ]);
  });

  it('restores the previous icons on down', () => {
    const updates = buildAiChatInboxCommandIconUpdates({
      flatCommandMenuItemByUniversalIdentifier: {
        [SNOOZE_UNIVERSAL_IDENTIFIER]: buildExistingItem(
          SNOOZE_UNIVERSAL_IDENTIFIER,
          'IconZzz',
        ),
      },
      direction: 'down',
      now: NOW,
    });

    expect(updates).toEqual([
      expect.objectContaining({
        universalIdentifier: SNOOZE_UNIVERSAL_IDENTIFIER,
        icon: 'IconClock',
      }),
    ]);
  });

  it('leaves a customized icon untouched', () => {
    const updates = buildAiChatInboxCommandIconUpdates({
      flatCommandMenuItemByUniversalIdentifier: {
        [SNOOZE_UNIVERSAL_IDENTIFIER]: buildExistingItem(
          SNOOZE_UNIVERSAL_IDENTIFIER,
          'IconBed',
        ),
      },
      direction: 'up',
      now: NOW,
    });

    expect(updates).toEqual([]);
  });

  it('returns no update when the command menu items are missing', () => {
    const updates = buildAiChatInboxCommandIconUpdates({
      flatCommandMenuItemByUniversalIdentifier: {},
      direction: 'up',
      now: NOW,
    });

    expect(updates).toEqual([]);
  });
});
