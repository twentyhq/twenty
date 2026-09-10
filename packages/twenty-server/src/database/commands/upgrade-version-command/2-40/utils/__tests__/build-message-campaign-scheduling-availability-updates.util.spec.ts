import { buildMessageCampaignSchedulingAvailabilityUpdates } from 'src/database/commands/upgrade-version-command/2-40/utils/build-message-campaign-scheduling-availability-updates.util';
import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { STANDARD_COMMAND_MENU_ITEMS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-command-menu-item.constant';

const SENDING_ONLY_EXPRESSION =
  'numberOfSelectedRecords == 1 and everyEquals(selectedRecords, "status", "SENDING") and noneDefined(selectedRecords, "deletedAt") and featureFlags.IS_EMAIL_GROUP_ENABLED';

const DRAFT_ONLY_EXPRESSION =
  'numberOfSelectedRecords == 1 and everyEquals(selectedRecords, "status", "DRAFT") and noneDefined(selectedRecords, "deletedAt") and featureFlags.IS_EMAIL_GROUP_ENABLED';

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

describe('buildMessageCampaignSchedulingAvailabilityUpdates', () => {
  it('widens cancel from sending only to the scheduled state as well', () => {
    const { universalIdentifier, conditionalAvailabilityExpression } =
      STANDARD_COMMAND_MENU_ITEMS.cancelMessageCampaign;

    const updates = buildMessageCampaignSchedulingAvailabilityUpdates({
      flatCommandMenuItemByUniversalIdentifier: {
        [universalIdentifier]: buildExistingItem(
          universalIdentifier,
          SENDING_ONLY_EXPRESSION,
        ),
      },
      now: NOW,
    });

    expect(updates).toEqual([
      expect.objectContaining({
        universalIdentifier,
        conditionalAvailabilityExpression,
        updatedAt: NOW,
      }),
    ]);
  });

  it('widens send and send test from draft only to the scheduled state as well', () => {
    const sendCommand = STANDARD_COMMAND_MENU_ITEMS.sendMessageCampaign;
    const testCommand = STANDARD_COMMAND_MENU_ITEMS.sendMessageCampaignTest;

    const updates = buildMessageCampaignSchedulingAvailabilityUpdates({
      flatCommandMenuItemByUniversalIdentifier: {
        [sendCommand.universalIdentifier]: buildExistingItem(
          sendCommand.universalIdentifier,
          DRAFT_ONLY_EXPRESSION,
        ),
        [testCommand.universalIdentifier]: buildExistingItem(
          testCommand.universalIdentifier,
          DRAFT_ONLY_EXPRESSION,
        ),
      },
      now: NOW,
    });

    expect(updates.map(({ conditionalAvailabilityExpression }) => conditionalAvailabilityExpression)).toEqual(
      expect.arrayContaining([
        sendCommand.conditionalAvailabilityExpression,
        testCommand.conditionalAvailabilityExpression,
      ]),
    );
  });

  it('leaves a workspace that customized its own expression alone', () => {
    const { universalIdentifier } =
      STANDARD_COMMAND_MENU_ITEMS.cancelMessageCampaign;

    const updates = buildMessageCampaignSchedulingAvailabilityUpdates({
      flatCommandMenuItemByUniversalIdentifier: {
        [universalIdentifier]: buildExistingItem(
          universalIdentifier,
          'numberOfSelectedRecords == 1',
        ),
      },
      now: NOW,
    });

    expect(updates).toEqual([]);
  });

  it('skips a command the workspace does not have', () => {
    expect(
      buildMessageCampaignSchedulingAvailabilityUpdates({
        flatCommandMenuItemByUniversalIdentifier: {},
        now: NOW,
      }),
    ).toEqual([]);
  });
});
