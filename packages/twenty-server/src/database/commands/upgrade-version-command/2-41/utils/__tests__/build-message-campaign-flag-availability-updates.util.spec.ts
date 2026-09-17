import {
  getSystemNavigationCommandMenuItemUniversalIdentifier,
  TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
} from 'twenty-shared/application';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import { buildMessageCampaignFlagAvailabilityUpdates } from 'src/database/commands/upgrade-version-command/2-41/utils/build-message-campaign-flag-availability-updates.util';
import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { STANDARD_COMMAND_MENU_ITEMS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-command-menu-item.constant';

const NOW = '2026-09-14T00:00:00.000Z';

const buildExistingItem = (
  universalIdentifier: string,
  conditionalAvailabilityExpression: string | null,
): FlatCommandMenuItem =>
  ({
    universalIdentifier,
    conditionalAvailabilityExpression,
    updatedAt: '2025-01-01T00:00:00.000Z',
  }) as FlatCommandMenuItem;

describe('buildMessageCampaignFlagAvailabilityUpdates', () => {
  it('moves a campaign action from the email group flag to the campaign flag and keeps the rest of the expression', () => {
    const { universalIdentifier } = STANDARD_COMMAND_MENU_ITEMS.sendMessageCampaign;

    const updates = buildMessageCampaignFlagAvailabilityUpdates({
      flatCommandMenuItemByUniversalIdentifier: {
        [universalIdentifier]: buildExistingItem(
          universalIdentifier,
          'numberOfSelectedRecords == 1 and featureFlags.IS_EMAIL_GROUP_ENABLED',
        ),
      },
      now: NOW,
    });

    expect(updates).toEqual([
      expect.objectContaining({
        universalIdentifier,
        conditionalAvailabilityExpression:
          'numberOfSelectedRecords == 1 and featureFlags.IS_MESSAGE_CAMPAIGN_ENABLED',
        updatedAt: NOW,
      }),
    ]);
  });

  it('moves the campaign and list navigation items of the standard application', () => {
    const universalIdentifier =
      getSystemNavigationCommandMenuItemUniversalIdentifier({
        objectMetadataApplicationUniversalIdentifier:
          TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
        objectUniversalIdentifier: STANDARD_OBJECTS.messageList.universalIdentifier,
      });

    const updates = buildMessageCampaignFlagAvailabilityUpdates({
      flatCommandMenuItemByUniversalIdentifier: {
        [universalIdentifier]: buildExistingItem(
          universalIdentifier,
          'featureFlags.IS_EMAIL_GROUP_ENABLED and targetObjectReadPermissions.messageList',
        ),
      },
      now: NOW,
    });

    expect(updates).toEqual([
      expect.objectContaining({
        conditionalAvailabilityExpression:
          'featureFlags.IS_MESSAGE_CAMPAIGN_ENABLED and targetObjectReadPermissions.messageList',
      }),
    ]);
  });

  it('leaves untouched an item that no longer references the email group flag or is absent', () => {
    const { universalIdentifier } =
      STANDARD_COMMAND_MENU_ITEMS.cancelMessageCampaign;

    expect(
      buildMessageCampaignFlagAvailabilityUpdates({
        flatCommandMenuItemByUniversalIdentifier: {
          [universalIdentifier]: buildExistingItem(
            universalIdentifier,
            'featureFlags.IS_MESSAGE_CAMPAIGN_ENABLED',
          ),
        },
        now: NOW,
      }),
    ).toEqual([]);
  });

  it('never rewrites an item outside the campaign set even when it uses the email group flag', () => {
    const universalIdentifier = 'unrelated-command-menu-item';

    expect(
      buildMessageCampaignFlagAvailabilityUpdates({
        flatCommandMenuItemByUniversalIdentifier: {
          [universalIdentifier]: buildExistingItem(
            universalIdentifier,
            'featureFlags.IS_EMAIL_GROUP_ENABLED',
          ),
        },
        now: NOW,
      }),
    ).toEqual([]);
  });
});
