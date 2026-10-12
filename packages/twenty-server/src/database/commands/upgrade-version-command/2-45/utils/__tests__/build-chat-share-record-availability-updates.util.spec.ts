import {
  evaluateConditionalAvailabilityExpression,
  isDefined,
} from 'twenty-shared/utils';

import {
  CHAT_OR_RECORD_SHARING_FLAG_EXPRESSION,
  buildChatShareRecordAvailabilityUpdates,
} from 'src/database/commands/upgrade-version-command/2-45/utils/build-chat-share-record-availability-updates.util';
import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { STANDARD_COMMAND_MENU_ITEMS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-command-menu-item.constant';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';

const NOW = '2026-10-01T12:00:00.000Z';
const CHAT_ONLY_EXPRESSION =
  'numberOfSelectedRecords == 1 and featureFlags.IS_AI_CHAT_SHARING_DROPDOWN_ENABLED and noneDefined(selectedRecords, "deletedAt")';

const { allFlatEntityMaps } = computeTwentyStandardApplicationAllFlatEntityMaps(
  {
    now: '2026-09-30T12:00:00.000Z',
    workspaceId: '20202020-1111-4111-8111-111111111111',
    twentyStandardApplicationId: '20202020-2222-4222-8222-222222222222',
  },
);

const standardShareRecord =
  allFlatEntityMaps.flatCommandMenuItemMaps.byUniversalIdentifier[
    STANDARD_COMMAND_MENU_ITEMS.shareRecord.universalIdentifier
  ];

if (!isDefined(standardShareRecord)) {
  throw new Error('Standard Share command menu item missing');
}

const withExpression = (
  conditionalAvailabilityExpression: string,
): FlatCommandMenuItem => ({
  ...standardShareRecord,
  conditionalAvailabilityExpression,
});

const buildUpdates = (
  shareRecord: FlatCommandMenuItem | undefined,
  direction: 'up' | 'down',
) =>
  buildChatShareRecordAvailabilityUpdates({
    flatCommandMenuItemsByUniversalIdentifier: isDefined(shareRecord)
      ? { [standardShareRecord.universalIdentifier]: shareRecord }
      : {},
    now: NOW,
    direction,
  });

const isAvailable = (
  expression: string,
  featureFlags: Record<string, boolean>,
  objectMetadataItem: Record<string, unknown>,
) =>
  evaluateConditionalAvailabilityExpression(expression, {
    featureFlags,
    objectMetadataItem,
    numberOfSelectedRecords: 1,
    selectedRecords: [{ id: 'record-1', deletedAt: null }],
  });

describe('buildChatShareRecordAvailabilityUpdates', () => {
  it('matches the standard application item', () => {
    expect(standardShareRecord).toMatchObject({
      conditionalAvailabilityExpression: CHAT_OR_RECORD_SHARING_FLAG_EXPRESSION,
      isPinned: true,
    });
    expect(standardShareRecord.availabilityObjectMetadataId).not.toBeNull();
  });

  it('lets the record sharing flag show the chat item on up and takes it back on down', () => {
    expect(buildUpdates(withExpression(CHAT_ONLY_EXPRESSION), 'up')).toEqual([
      {
        ...withExpression(CHAT_OR_RECORD_SHARING_FLAG_EXPRESSION),
        updatedAt: NOW,
      },
    ]);
    expect(
      buildUpdates(
        withExpression(CHAT_OR_RECORD_SHARING_FLAG_EXPRESSION),
        'down',
      ),
    ).toEqual([{ ...withExpression(CHAT_ONLY_EXPRESSION), updatedAt: NOW }]);
  });

  it('leaves a customized or missing item alone', () => {
    expect(
      buildUpdates(withExpression('numberOfSelectedRecords == 1'), 'up'),
    ).toEqual([]);
    expect(buildUpdates(undefined, 'up')).toEqual([]);
  });

  describe('availability', () => {
    const shareAnyRecordExpression =
      STANDARD_COMMAND_MENU_ITEMS.shareAnyRecord
        .conditionalAvailabilityExpression;
    const company = { nameSingular: 'company', isSystem: false };
    const chat = { nameSingular: 'agentChatThread', isSystem: true };
    const recordSharing = { IS_RECORD_LEVEL_SHARING_ENABLED: true };

    it('offers the unpinned item on regular objects once record sharing is enabled', () => {
      expect(
        isAvailable(shareAnyRecordExpression, recordSharing, company),
      ).toBe(true);
      expect(isAvailable(shareAnyRecordExpression, {}, company)).toBe(false);
    });

    it.each(['APPLICATION', 'SYSTEM'])(
      'keeps the unpinned item off %s objects and off chats',
      (readability) => {
        expect(
          isAvailable(shareAnyRecordExpression, recordSharing, {
            ...company,
            readability,
          }),
        ).toBe(false);
        expect(isAvailable(shareAnyRecordExpression, recordSharing, chat)).toBe(
          false,
        );
      },
    );

    it.each<Record<string, boolean>>([
      { IS_AI_CHAT_SHARING_DROPDOWN_ENABLED: true },
      recordSharing,
    ])('keeps the pinned chat item with %o', (featureFlags) => {
      expect(
        isAvailable(CHAT_OR_RECORD_SHARING_FLAG_EXPRESSION, featureFlags, chat),
      ).toBe(true);
    });
  });
});
