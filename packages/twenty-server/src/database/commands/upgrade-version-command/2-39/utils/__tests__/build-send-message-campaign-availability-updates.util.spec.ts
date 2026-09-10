import { buildSendMessageCampaignAvailabilityUpdates } from 'src/database/commands/upgrade-version-command/2-39/utils/build-send-message-campaign-availability-updates.util';
import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { STANDARD_COMMAND_MENU_ITEMS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-command-menu-item.constant';

const LEGACY_EXPRESSION =
  'numberOfSelectedRecords >= 1 and everyEquals(selectedRecords, "status", "DRAFT") and noneDefined(selectedRecords, "deletedAt")';

const NOW = '2026-01-01T00:00:00.000Z';

const buildExistingItem = (
  universalIdentifier: string,
  conditionalAvailabilityExpression: string,
): FlatCommandMenuItem =>
  ({
    universalIdentifier,
    conditionalAvailabilityExpression,
    updatedAt: '2025-01-01T00:00:00.000Z',
  }) as FlatCommandMenuItem;

describe('buildSendMessageCampaignAvailabilityUpdates', () => {
  it('rewrites a send command still carrying the legacy expression', () => {
    const { universalIdentifier, conditionalAvailabilityExpression } =
      STANDARD_COMMAND_MENU_ITEMS.sendMessageCampaign;

    const updates = buildSendMessageCampaignAvailabilityUpdates({
      flatCommandMenuItemByUniversalIdentifier: {
        [universalIdentifier]: buildExistingItem(
          universalIdentifier,
          LEGACY_EXPRESSION,
        ),
      },
      now: NOW,
    });

    expect(updates).toHaveLength(1);
    expect(updates[0].conditionalAvailabilityExpression).toBe(
      conditionalAvailabilityExpression,
    );
    expect(updates[0].updatedAt).toBe(NOW);
  });

  it('leaves a command a workspace has customised alone', () => {
    const { universalIdentifier } =
      STANDARD_COMMAND_MENU_ITEMS.sendMessageCampaign;

    const updates = buildSendMessageCampaignAvailabilityUpdates({
      flatCommandMenuItemByUniversalIdentifier: {
        [universalIdentifier]: buildExistingItem(
          universalIdentifier,
          'numberOfSelectedRecords == 3',
        ),
      },
      now: NOW,
    });

    expect(updates).toEqual([]);
  });

  it('skips a command the workspace does not have', () => {
    const updates = buildSendMessageCampaignAvailabilityUpdates({
      flatCommandMenuItemByUniversalIdentifier: {},
      now: NOW,
    });

    expect(updates).toEqual([]);
  });

  it('rewrites both send commands when both are still on the legacy expression', () => {
    const send = STANDARD_COMMAND_MENU_ITEMS.sendMessageCampaign;
    const sendTest = STANDARD_COMMAND_MENU_ITEMS.sendMessageCampaignTest;

    const updates = buildSendMessageCampaignAvailabilityUpdates({
      flatCommandMenuItemByUniversalIdentifier: {
        [send.universalIdentifier]: buildExistingItem(
          send.universalIdentifier,
          LEGACY_EXPRESSION,
        ),
        [sendTest.universalIdentifier]: buildExistingItem(
          sendTest.universalIdentifier,
          LEGACY_EXPRESSION,
        ),
      },
      now: NOW,
    });

    expect(updates).toEqual([
      {
        ...buildExistingItem(send.universalIdentifier, LEGACY_EXPRESSION),
        conditionalAvailabilityExpression:
          send.conditionalAvailabilityExpression,
        updatedAt: NOW,
      },
      {
        ...buildExistingItem(sendTest.universalIdentifier, LEGACY_EXPRESSION),
        conditionalAvailabilityExpression:
          sendTest.conditionalAvailabilityExpression,
        updatedAt: NOW,
      },
    ]);
  });
});
