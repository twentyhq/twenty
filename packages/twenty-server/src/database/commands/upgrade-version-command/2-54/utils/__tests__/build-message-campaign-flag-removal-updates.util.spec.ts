import {
  getSystemNavigationCommandMenuItemUniversalIdentifier,
  TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
} from 'twenty-shared/application';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { CommandMenuItemAvailabilityType } from 'twenty-shared/types';

import { buildMessageCampaignFlagRemovalUpdates } from 'src/database/commands/upgrade-version-command/2-54/utils/build-message-campaign-flag-removal-updates.util';
import { EngineComponentKey } from 'src/engine/metadata-modules/command-menu-item/enums/engine-component-key.enum';
import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { buildNavigationConditionalAvailabilityExpression } from 'src/engine/metadata-modules/flat-command-menu-item/utils/build-object-navigation-universal-flat-command-menu-item.util';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { STANDARD_COMMAND_MENU_ITEMS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-command-menu-item.constant';

const NOW = '2026-10-26T12:00:00.000Z';
const FLAG = 'featureFlags.IS_MESSAGE_CAMPAIGN_ENABLED';

const buildCommandMenuItem = ({
  universalIdentifier,
  conditionalAvailabilityExpression,
  applicationUniversalIdentifier = TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
}: {
  universalIdentifier: string;
  conditionalAvailabilityExpression: string | null;
  applicationUniversalIdentifier?: string;
}): FlatCommandMenuItem => ({
  workspaceId: '20202020-1111-4111-8111-111111111111',
  applicationId: '20202020-2222-4222-8222-222222222222',
  applicationUniversalIdentifier,
  createdAt: NOW,
  updatedAt: NOW,
  id: universalIdentifier,
  universalIdentifier,
  label: 'Campaign',
  shortLabel: 'Campaign',
  icon: 'IconSend',
  position: 66,
  isPinned: false,
  isActive: true,
  isSystemSideEffect: false,
  engineComponentKey: EngineComponentKey.COMPOSE_CAMPAIGN,
  availabilityType: CommandMenuItemAvailabilityType.GLOBAL,
  conditionalAvailabilityExpression,
  conditionalPinnedExpression: null,
  availabilityObjectMetadataId: null,
  availabilityObjectMetadataUniversalIdentifier: null,
  navigationTargetObjectMetadataId: null,
  navigationTargetObjectMetadataUniversalIdentifier: null,
  frontComponentId: null,
  frontComponentUniversalIdentifier: null,
  pageLayoutId: null,
  pageLayoutUniversalIdentifier: null,
  workflowVersionId: null,
  coreWorkflowVersionId: null,
  hotKeys: null,
  payload: null,
  overrides: null,
  universalOverrides: null,
});

const buildMaps = (
  commandMenuItems: FlatCommandMenuItem[],
): FlatEntityMaps<FlatCommandMenuItem> => ({
  ...createEmptyFlatEntityMaps(),
  byUniversalIdentifier: Object.fromEntries(
    commandMenuItems.map((commandMenuItem) => [
      commandMenuItem.universalIdentifier,
      commandMenuItem,
    ]),
  ),
});

const FLAGGED_SEND_CAMPAIGN_EXPRESSION = `numberOfSelectedRecords == 1 and (everyEquals(selectedRecords, "status", "DRAFT") or everyEquals(selectedRecords, "status", "SCHEDULED")) and noneDefined(selectedRecords, "deletedAt") and ${FLAG}`;
const FLAGGED_ADD_TO_LIST_EXPRESSION = `${FLAG} and targetObjectWritePermissions.messageListMember and numberOfSelectedRecords >= 1 and not hasAnySoftDeleteFilterOnView and (isSelectAll or noneDefined(selectedRecords, "deletedAt"))`;

describe('buildMessageCampaignFlagRemovalUpdates', () => {
  it('drops the flag and lands on the shipped standard expressions', () => {
    const updates = buildMessageCampaignFlagRemovalUpdates({
      flatCommandMenuItemMaps: buildMaps([
        buildCommandMenuItem({
          universalIdentifier:
            STANDARD_COMMAND_MENU_ITEMS.composeCampaign.universalIdentifier,
          conditionalAvailabilityExpression: FLAG,
        }),
        buildCommandMenuItem({
          universalIdentifier:
            STANDARD_COMMAND_MENU_ITEMS.sendMessageCampaign.universalIdentifier,
          conditionalAvailabilityExpression: FLAGGED_SEND_CAMPAIGN_EXPRESSION,
        }),
        buildCommandMenuItem({
          universalIdentifier:
            STANDARD_COMMAND_MENU_ITEMS.addToMessageList.universalIdentifier,
          conditionalAvailabilityExpression: FLAGGED_ADD_TO_LIST_EXPRESSION,
        }),
      ]),
      direction: 'up',
      now: NOW,
    });

    expect(
      updates.map(
        ({ universalIdentifier, conditionalAvailabilityExpression }) => ({
          universalIdentifier,
          conditionalAvailabilityExpression,
        }),
      ),
    ).toEqual(
      [
        STANDARD_COMMAND_MENU_ITEMS.composeCampaign,
        STANDARD_COMMAND_MENU_ITEMS.sendMessageCampaign,
        STANDARD_COMMAND_MENU_ITEMS.addToMessageList,
      ].map(({ universalIdentifier, conditionalAvailabilityExpression }) => ({
        universalIdentifier,
        conditionalAvailabilityExpression,
      })),
    );
  });

  it('turns every flagged campaign item into its shipped expression and is a no-op on a second run', () => {
    const flaggedExpressionByUniversalIdentifier: [
      string,
      string,
      string | null,
    ][] = [
      [
        STANDARD_COMMAND_MENU_ITEMS.composeCampaignPinned.universalIdentifier,
        `pageType == "INDEX_PAGE" and ${FLAG}`,
        STANDARD_COMMAND_MENU_ITEMS.composeCampaignPinned
          .conditionalAvailabilityExpression,
      ],
      [
        STANDARD_COMMAND_MENU_ITEMS.sendMessageCampaignTest.universalIdentifier,
        FLAGGED_SEND_CAMPAIGN_EXPRESSION,
        STANDARD_COMMAND_MENU_ITEMS.sendMessageCampaignTest
          .conditionalAvailabilityExpression,
      ],
      [
        STANDARD_COMMAND_MENU_ITEMS.cancelMessageCampaign.universalIdentifier,
        `numberOfSelectedRecords == 1 and (everyEquals(selectedRecords, "status", "SCHEDULED") or everyEquals(selectedRecords, "status", "SENDING")) and noneDefined(selectedRecords, "deletedAt") and ${FLAG}`,
        STANDARD_COMMAND_MENU_ITEMS.cancelMessageCampaign
          .conditionalAvailabilityExpression,
      ],
      [
        STANDARD_COMMAND_MENU_ITEMS.duplicateMessageCampaign
          .universalIdentifier,
        `numberOfSelectedRecords == 1 and noneDefined(selectedRecords, "deletedAt") and objectPermissions.canUpdateObjectRecords and ${FLAG}`,
        STANDARD_COMMAND_MENU_ITEMS.duplicateMessageCampaign
          .conditionalAvailabilityExpression,
      ],
      [
        STANDARD_COMMAND_MENU_ITEMS.duplicateMessageList.universalIdentifier,
        `${FLAG} and numberOfSelectedRecords == 1 and noneDefined(selectedRecords, "deletedAt") and objectPermissions.canUpdateObjectRecords`,
        STANDARD_COMMAND_MENU_ITEMS.duplicateMessageList
          .conditionalAvailabilityExpression,
      ],
      [
        STANDARD_COMMAND_MENU_ITEMS.addViewToMessageList.universalIdentifier,
        `${FLAG} and targetObjectWritePermissions.messageListMember and pageType == "INDEX_PAGE" and not hasAnySoftDeleteFilterOnView`,
        STANDARD_COMMAND_MENU_ITEMS.addViewToMessageList
          .conditionalAvailabilityExpression,
      ],
      ...(
        [
          [
            STANDARD_OBJECTS.messageCampaign.universalIdentifier,
            'messageCampaign',
          ],
          [STANDARD_OBJECTS.messageList.universalIdentifier, 'messageList'],
        ] as const
      ).map(
        ([objectUniversalIdentifier, nameSingular]): [
          string,
          string,
          string,
        ] => [
          getSystemNavigationCommandMenuItemUniversalIdentifier({
            objectMetadataApplicationUniversalIdentifier:
              TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
            objectUniversalIdentifier,
          }),
          `${FLAG} and targetObjectReadPermissions.${nameSingular}`,
          buildNavigationConditionalAvailabilityExpression({
            universalIdentifier: objectUniversalIdentifier,
            nameSingular,
          }),
        ],
      ),
    ];

    const updates = buildMessageCampaignFlagRemovalUpdates({
      flatCommandMenuItemMaps: buildMaps(
        flaggedExpressionByUniversalIdentifier.map(
          ([universalIdentifier, conditionalAvailabilityExpression]) =>
            buildCommandMenuItem({
              universalIdentifier,
              conditionalAvailabilityExpression,
            }),
        ),
      ),
      direction: 'up',
      now: NOW,
    });

    expect(
      updates.map(
        ({ universalIdentifier, conditionalAvailabilityExpression }) => [
          universalIdentifier,
          conditionalAvailabilityExpression,
        ],
      ),
    ).toEqual(
      expect.arrayContaining(
        flaggedExpressionByUniversalIdentifier.map(
          ([universalIdentifier, , expectedExpression]) => [
            universalIdentifier,
            expectedExpression,
          ],
        ),
      ),
    );
    expect(updates).toHaveLength(flaggedExpressionByUniversalIdentifier.length);

    expect(
      buildMessageCampaignFlagRemovalUpdates({
        flatCommandMenuItemMaps: buildMaps(updates),
        direction: 'up',
        now: NOW,
      }),
    ).toEqual([]);
  });

  it('strips the flag from older stored variants without touching the rest of the expression', () => {
    const olderDraftOnlyExpression =
      'numberOfSelectedRecords == 1 and everyEquals(selectedRecords, "status", "DRAFT") and noneDefined(selectedRecords, "deletedAt")';

    const updates = buildMessageCampaignFlagRemovalUpdates({
      flatCommandMenuItemMaps: buildMaps([
        buildCommandMenuItem({
          universalIdentifier:
            STANDARD_COMMAND_MENU_ITEMS.sendMessageCampaign.universalIdentifier,
          conditionalAvailabilityExpression: `${olderDraftOnlyExpression} and ${FLAG}`,
        }),
      ]),
      direction: 'up',
      now: NOW,
    });

    expect(updates[0]?.conditionalAvailabilityExpression).toBe(
      olderDraftOnlyExpression,
    );
  });

  it('leaves an expression alone when the flag is not a leading or trailing condition', () => {
    const updates = buildMessageCampaignFlagRemovalUpdates({
      flatCommandMenuItemMaps: buildMaps([
        buildCommandMenuItem({
          universalIdentifier:
            STANDARD_COMMAND_MENU_ITEMS.sendMessageCampaign.universalIdentifier,
          conditionalAvailabilityExpression: `not ${FLAG} and numberOfSelectedRecords == 1`,
        }),
        buildCommandMenuItem({
          universalIdentifier:
            STANDARD_COMMAND_MENU_ITEMS.cancelMessageCampaign
              .universalIdentifier,
          conditionalAvailabilityExpression: `numberOfSelectedRecords == 1 or ${FLAG}`,
        }),
      ]),
      direction: 'up',
      now: NOW,
    });

    expect(updates).toEqual([]);
  });

  it('leaves items without the flag and items owned by another application untouched', () => {
    const updates = buildMessageCampaignFlagRemovalUpdates({
      flatCommandMenuItemMaps: buildMaps([
        buildCommandMenuItem({
          universalIdentifier:
            STANDARD_COMMAND_MENU_ITEMS.composeCampaign.universalIdentifier,
          conditionalAvailabilityExpression: null,
        }),
        buildCommandMenuItem({
          universalIdentifier:
            STANDARD_COMMAND_MENU_ITEMS.sendMessageCampaign.universalIdentifier,
          conditionalAvailabilityExpression: FLAGGED_SEND_CAMPAIGN_EXPRESSION,
          applicationUniversalIdentifier:
            '20202020-3333-4333-8333-333333333333',
        }),
      ]),
      direction: 'up',
      now: NOW,
    });

    expect(updates).toEqual([]);
  });

  it('puts the flag back on down only for items still on the shipped expression', () => {
    const updates = buildMessageCampaignFlagRemovalUpdates({
      flatCommandMenuItemMaps: buildMaps([
        buildCommandMenuItem({
          universalIdentifier:
            STANDARD_COMMAND_MENU_ITEMS.addToMessageList.universalIdentifier,
          conditionalAvailabilityExpression:
            STANDARD_COMMAND_MENU_ITEMS.addToMessageList
              .conditionalAvailabilityExpression,
        }),
        buildCommandMenuItem({
          universalIdentifier:
            STANDARD_COMMAND_MENU_ITEMS.sendMessageCampaign.universalIdentifier,
          conditionalAvailabilityExpression: 'numberOfSelectedRecords == 1',
        }),
      ]),
      direction: 'down',
      now: NOW,
    });

    expect(
      updates.map(
        ({ universalIdentifier, conditionalAvailabilityExpression }) => ({
          universalIdentifier,
          conditionalAvailabilityExpression,
        }),
      ),
    ).toEqual([
      {
        universalIdentifier:
          STANDARD_COMMAND_MENU_ITEMS.addToMessageList.universalIdentifier,
        conditionalAvailabilityExpression: FLAGGED_ADD_TO_LIST_EXPRESSION,
      },
    ]);
  });
});
