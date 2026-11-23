import { buildLimitAssignToBulkSelectionUpdate } from 'src/database/commands/upgrade-version-command/2-63/utils/build-limit-assign-to-bulk-selection-update.util';
import { STANDARD_COMMAND_MENU_ITEMS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-command-menu-item.constant';

const NOW = '2026-11-20T00:00:00.000Z';

const { universalIdentifier: ASSIGN_UNIVERSAL_IDENTIFIER } =
  STANDARD_COMMAND_MENU_ITEMS.assignAiChat;

const buildExistingItem = (conditionalAvailabilityExpression: string) => ({
  universalIdentifier: ASSIGN_UNIVERSAL_IDENTIFIER,
  conditionalAvailabilityExpression,
  updatedAt: '2025-01-01T00:00:00.000Z',
});

describe('buildLimitAssignToBulkSelectionUpdate', () => {
  it('offers Assign only when several chats are selected', () => {
    const updates = buildLimitAssignToBulkSelectionUpdate({
      flatCommandMenuItemByUniversalIdentifier: {
        [ASSIGN_UNIVERSAL_IDENTIFIER]: buildExistingItem(
          'numberOfSelectedRecords >= 1 and permissionFlags.AI and featureFlags.IS_AI_CHAT_INBOX_ENABLED and noneDefined(selectedRecords, "deletedAt") and noneEquals(selectedRecords, "recordPermissions.canUpdate", false)',
        ),
      },
      now: NOW,
    });

    expect(updates).toEqual([
      expect.objectContaining({
        universalIdentifier: ASSIGN_UNIVERSAL_IDENTIFIER,
        conditionalAvailabilityExpression: expect.stringMatching(
          /^numberOfSelectedRecords >= 2 and /,
        ),
        updatedAt: NOW,
      }),
    ]);
  });

  it('leaves a customized availability expression untouched', () => {
    const updates = buildLimitAssignToBulkSelectionUpdate({
      flatCommandMenuItemByUniversalIdentifier: {
        [ASSIGN_UNIVERSAL_IDENTIFIER]: buildExistingItem(
          'numberOfSelectedRecords == 1',
        ),
      },
      now: NOW,
    });

    expect(updates).toEqual([]);
  });
});
