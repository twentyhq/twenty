import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import { buildMissingStandardCommandMenuItemsToCreate } from 'src/database/commands/upgrade-version-command/2-39/utils/build-missing-standard-command-menu-items-to-create.util';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { STANDARD_COMMAND_MENU_ITEMS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-command-menu-item.constant';
import { TWENTY_STANDARD_APPLICATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-standard-applications';

const NOW = '2026-09-01T12:00:00.000Z';
const WORKSPACE_ID = 'workspace-id';
const APPLICATION_ID = 'application-id';

const SEND_COMMAND_MENU_ITEM = {
  universalIdentifier:
    STANDARD_COMMAND_MENU_ITEMS.sendMessageCampaign.universalIdentifier,
  applicationId: APPLICATION_ID,
  applicationUniversalIdentifier: TWENTY_STANDARD_APPLICATION.universalIdentifier,
};

const MESSAGE_CAMPAIGN_OBJECT = {
  id: 'message-campaign-object-id',
  universalIdentifier: STANDARD_OBJECTS.messageCampaign.universalIdentifier,
} as FlatObjectMetadata;

const buildFlatObjectMetadataMaps = (flatObjectMetadata?: FlatObjectMetadata) => ({
  ...createEmptyFlatEntityMaps(),
  byUniversalIdentifier: flatObjectMetadata
    ? { [flatObjectMetadata.universalIdentifier]: flatObjectMetadata }
    : {},
});

describe('buildMissingStandardCommandMenuItemsToCreate', () => {
  it('creates the command under the workspace standard application', () => {
    const [created] = buildMissingStandardCommandMenuItemsToCreate({
      commandMenuItemNames: ['duplicateMessageCampaign'],
      flatCommandMenuItemByUniversalIdentifier: {
        [SEND_COMMAND_MENU_ITEM.universalIdentifier]: SEND_COMMAND_MENU_ITEM,
      },
      flatObjectMetadataMaps: buildFlatObjectMetadataMaps(
        MESSAGE_CAMPAIGN_OBJECT,
      ),
      workspaceId: WORKSPACE_ID,
      now: NOW,
    });

    expect(created).toMatchObject({
      universalIdentifier:
        STANDARD_COMMAND_MENU_ITEMS.duplicateMessageCampaign
          .universalIdentifier,
      applicationId: APPLICATION_ID,
      workspaceId: WORKSPACE_ID,
      availabilityObjectMetadataId: MESSAGE_CAMPAIGN_OBJECT.id,
      conditionalPinnedExpression:
        STANDARD_COMMAND_MENU_ITEMS.duplicateMessageCampaign
          .conditionalPinnedExpression,
      createdAt: NOW,
    });
  });

  it('skips a command the workspace already has', () => {
    const existing = {
      ...SEND_COMMAND_MENU_ITEM,
      universalIdentifier:
        STANDARD_COMMAND_MENU_ITEMS.duplicateMessageCampaign
          .universalIdentifier,
    };

    expect(
      buildMissingStandardCommandMenuItemsToCreate({
        commandMenuItemNames: ['duplicateMessageCampaign'],
        flatCommandMenuItemByUniversalIdentifier: {
          [existing.universalIdentifier]: existing,
        },
        flatObjectMetadataMaps: buildFlatObjectMetadataMaps(
          MESSAGE_CAMPAIGN_OBJECT,
        ),
        workspaceId: WORKSPACE_ID,
        now: NOW,
      }),
    ).toEqual([]);
  });

  it('skips a command whose object the workspace does not have', () => {
    expect(
      buildMissingStandardCommandMenuItemsToCreate({
        commandMenuItemNames: ['duplicateMessageCampaign'],
        flatCommandMenuItemByUniversalIdentifier: {
          [SEND_COMMAND_MENU_ITEM.universalIdentifier]: SEND_COMMAND_MENU_ITEM,
        },
        flatObjectMetadataMaps: buildFlatObjectMetadataMaps(),
        workspaceId: WORKSPACE_ID,
        now: NOW,
      }),
    ).toEqual([]);
  });

  it('skips everything when no standard command reveals the application id', () => {
    expect(
      buildMissingStandardCommandMenuItemsToCreate({
        commandMenuItemNames: ['duplicateMessageCampaign'],
        flatCommandMenuItemByUniversalIdentifier: {},
        flatObjectMetadataMaps: buildFlatObjectMetadataMaps(
          MESSAGE_CAMPAIGN_OBJECT,
        ),
        workspaceId: WORKSPACE_ID,
        now: NOW,
      }),
    ).toEqual([]);
  });
});
