import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import {
  CommandMenuItemAvailabilityType,
  MetadataReadability,
  MetadataWritability,
  ObjectOpenRecordIn,
  ObjectSharingReach,
} from 'twenty-shared/types';

import { buildGlobalChatCommandMenuItemUpdates } from 'src/database/commands/upgrade-version-command/2-52/utils/build-global-chat-command-menu-item-updates.util';
import { EngineComponentKey } from 'src/engine/metadata-modules/command-menu-item/enums/engine-component-key.enum';
import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { STANDARD_COMMAND_MENU_ITEMS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-command-menu-item.constant';

const NOW = '2026-10-21T12:00:00.000Z';
const NEW_AI_CHAT_UNIVERSAL_IDENTIFIER =
  STANDARD_COMMAND_MENU_ITEMS.newAiChat.universalIdentifier;
const OPEN_AI_CHAT_UNIVERSAL_IDENTIFIER =
  STANDARD_COMMAND_MENU_ITEMS.viewPreviousAiChats.universalIdentifier;
const AGENT_CHAT_THREAD_UNIVERSAL_IDENTIFIER =
  STANDARD_OBJECTS.agentChatThread.universalIdentifier;
const CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER =
  '20202020-3333-4333-8333-333333333333';
const PREVIOUS_NEW_CHAT_AVAILABILITY_EXPRESSION =
  'numberOfSelectedRecords == 1 and pageType == "RECORD_PAGE" and not isInSidePanel and permissionFlags.AI';
const NEW_CHAT_PINNED_EXPRESSION =
  'pageType == "RECORD_PAGE" and objectMetadataItem.nameSingular == "agentChatThread" and not isInSidePanel';
const SYNCABLE = {
  workspaceId: '20202020-1111-4111-8111-111111111111',
  applicationId: '20202020-2222-4222-8222-222222222222',
  applicationUniversalIdentifier:
    TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
  createdAt: NOW,
  updatedAt: NOW,
};
const NEW_CHAT: FlatCommandMenuItem = {
  ...SYNCABLE,
  id: 'new-chat-id',
  universalIdentifier: NEW_AI_CHAT_UNIVERSAL_IDENTIFIER,
  label: 'New chat',
  shortLabel: 'New chat',
  icon: 'IconMessageCirclePlus',
  position: 43,
  isPinned: true,
  isActive: true,
  isSystemSideEffect: false,
  engineComponentKey: EngineComponentKey.NEW_AI_CHAT,
  availabilityType: CommandMenuItemAvailabilityType.GLOBAL,
  conditionalAvailabilityExpression: 'permissionFlags.AI',
  conditionalPinnedExpression: NEW_CHAT_PINNED_EXPRESSION,
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
};
const OPEN_CHAT: FlatCommandMenuItem = {
  ...NEW_CHAT,
  id: 'open-chat-id',
  universalIdentifier: OPEN_AI_CHAT_UNIVERSAL_IDENTIFIER,
  label: 'Open chat',
  shortLabel: 'Open chat',
  icon: 'IconMessage',
  position: 44,
  isPinned: false,
  conditionalPinnedExpression: null,
  engineComponentKey: EngineComponentKey.VIEW_PREVIOUS_AI_CHATS,
};
const CHAT_OBJECT_METADATA: FlatObjectMetadata = {
  ...SYNCABLE,
  id: 'chat-object-id',
  universalIdentifier: AGENT_CHAT_THREAD_UNIVERSAL_IDENTIFIER,
  nameSingular: 'agentChatThread',
  namePlural: 'agentChatThreads',
  labelSingular: 'Chat',
  labelPlural: 'Chats',
  description: null,
  icon: 'IconMessage',
  color: null,
  isActive: true,
  isAuditLogged: true,
  isLabelSyncedWithName: false,
  isRemote: false,
  isSearchable: true,
  isSystem: true,
  isUIEditable: true,
  isUICreatable: true,
  readability: MetadataReadability.OPEN,
  writability: MetadataWritability.OPEN,
  sharingReach: ObjectSharingReach.WORKSPACE,
  readabilityParentFieldUniversalIdentifiers: null,
  openRecordIn: ObjectOpenRecordIn.USER_CHOICE,
  shortcut: null,
  duplicateCriteria: null,
  overrides: null,
  targetTableName: 'agentChatThread',
  labelIdentifierFieldMetadataId: null,
  labelIdentifierFieldMetadataUniversalIdentifier: null,
  imageIdentifierFieldMetadataId: null,
  imageIdentifierFieldMetadataUniversalIdentifier: null,
  viewIds: [],
  viewUniversalIdentifiers: [],
  fieldIds: [],
  fieldUniversalIdentifiers: [],
  indexMetadataIds: [],
  indexMetadataUniversalIdentifiers: [],
  searchFieldMetadataIds: [],
  searchFieldMetadataUniversalIdentifiers: [],
  objectPermissionIds: [],
  objectPermissionUniversalIdentifiers: [],
  fieldPermissionIds: [],
  fieldPermissionUniversalIdentifiers: [],
  pageLayoutIds: [],
  pageLayoutUniversalIdentifiers: [],
  navigationMenuItemIds: [],
  navigationMenuItemUniversalIdentifiers: [],
  commandMenuItemIds: [],
  commandMenuItemUniversalIdentifiers: [],
};
const FLAT_COMMAND_MENU_ITEM_MAPS: FlatEntityMaps<FlatCommandMenuItem> = {
  ...createEmptyFlatEntityMaps(),
  byUniversalIdentifier: {
    [NEW_AI_CHAT_UNIVERSAL_IDENTIFIER]: NEW_CHAT,
    [OPEN_AI_CHAT_UNIVERSAL_IDENTIFIER]: OPEN_CHAT,
  },
};
const FLAT_OBJECT_METADATA_MAPS: FlatEntityMaps<FlatObjectMetadata> = {
  ...createEmptyFlatEntityMaps(),
  byUniversalIdentifier: {
    [AGENT_CHAT_THREAD_UNIVERSAL_IDENTIFIER]: CHAT_OBJECT_METADATA,
  },
};

describe('buildGlobalChatCommandMenuItemUpdates', () => {
  it('migrates both commands while preserving identifiers, pin state and user overrides', () => {
    const newChat = {
      ...NEW_CHAT,
      availabilityType: CommandMenuItemAvailabilityType.RECORD_SELECTION,
      availabilityObjectMetadataId: 'chat-object-id',
      availabilityObjectMetadataUniversalIdentifier:
        AGENT_CHAT_THREAD_UNIVERSAL_IDENTIFIER,
      conditionalAvailabilityExpression:
        PREVIOUS_NEW_CHAT_AVAILABILITY_EXPRESSION,
      conditionalPinnedExpression: null,
      isPinned: false,
      overrides: {
        [CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER]: { label: 'My new chat' },
      },
    };
    const openChat = {
      ...OPEN_CHAT,
      label: 'View Previous AI Chats',
      shortLabel: 'Previous AI Chats',
      icon: 'IconHistory',
    };
    const updates = buildGlobalChatCommandMenuItemUpdates({
      flatCommandMenuItemMaps: {
        ...FLAT_COMMAND_MENU_ITEM_MAPS,
        byUniversalIdentifier: {
          [NEW_AI_CHAT_UNIVERSAL_IDENTIFIER]: newChat,
          [OPEN_AI_CHAT_UNIVERSAL_IDENTIFIER]: openChat,
        },
      },
      flatObjectMetadataMaps: FLAT_OBJECT_METADATA_MAPS,
      direction: 'up',
      now: NOW,
    });

    expect(updates).toEqual([
      {
        ...openChat,
        label: 'Open chat',
        shortLabel: 'Open chat',
        icon: 'IconMessage',
        updatedAt: NOW,
      },
      {
        ...newChat,
        availabilityType: CommandMenuItemAvailabilityType.GLOBAL,
        availabilityObjectMetadataId: null,
        availabilityObjectMetadataUniversalIdentifier: null,
        conditionalAvailabilityExpression: 'permissionFlags.AI',
        conditionalPinnedExpression: NEW_CHAT_PINNED_EXPRESSION,
        updatedAt: NOW,
      },
    ]);
  });

  it('leaves already migrated commands unchanged', () => {
    expect(
      buildGlobalChatCommandMenuItemUpdates({
        flatCommandMenuItemMaps: FLAT_COMMAND_MENU_ITEM_MAPS,
        flatObjectMetadataMaps: FLAT_OBJECT_METADATA_MAPS,
        direction: 'up',
        now: NOW,
      }),
    ).toEqual([]);
  });

  it('restores the previous labels, chat object binding and pinning on down', () => {
    const updates = buildGlobalChatCommandMenuItemUpdates({
      flatCommandMenuItemMaps: FLAT_COMMAND_MENU_ITEM_MAPS,
      flatObjectMetadataMaps: FLAT_OBJECT_METADATA_MAPS,
      direction: 'down',
      now: NOW,
    });

    expect(updates).toEqual([
      expect.objectContaining({
        universalIdentifier: OPEN_AI_CHAT_UNIVERSAL_IDENTIFIER,
        label: 'View Previous AI Chats',
        shortLabel: 'Previous AI Chats',
        icon: 'IconHistory',
      }),
      expect.objectContaining({
        universalIdentifier: NEW_AI_CHAT_UNIVERSAL_IDENTIFIER,
        availabilityType: CommandMenuItemAvailabilityType.RECORD_SELECTION,
        availabilityObjectMetadataId: CHAT_OBJECT_METADATA.id,
        availabilityObjectMetadataUniversalIdentifier:
          AGENT_CHAT_THREAD_UNIVERSAL_IDENTIFIER,
        conditionalAvailabilityExpression:
          PREVIOUS_NEW_CHAT_AVAILABILITY_EXPRESSION,
        conditionalPinnedExpression: null,
        isPinned: true,
      }),
    ]);
  });

  it('skips missing commands and commands owned by another application', () => {
    expect(
      buildGlobalChatCommandMenuItemUpdates({
        flatCommandMenuItemMaps: {
          ...FLAT_COMMAND_MENU_ITEM_MAPS,
          byUniversalIdentifier: {
            [NEW_AI_CHAT_UNIVERSAL_IDENTIFIER]: {
              ...NEW_CHAT,
              availabilityType:
                CommandMenuItemAvailabilityType.RECORD_SELECTION,
              applicationUniversalIdentifier:
                CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
            },
          },
        },
        flatObjectMetadataMaps: FLAT_OBJECT_METADATA_MAPS,
        direction: 'up',
        now: NOW,
      }),
    ).toEqual([]);
  });
});
