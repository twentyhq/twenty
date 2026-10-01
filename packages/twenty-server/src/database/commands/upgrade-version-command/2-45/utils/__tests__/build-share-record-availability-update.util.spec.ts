import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import {
  evaluateConditionalAvailabilityExpression,
  isDefined,
} from 'twenty-shared/utils';

import {
  ALL_OBJECTS_SHARE_RECORD_EXPRESSION,
  buildShareRecordAvailabilityUpdate,
} from 'src/database/commands/upgrade-version-command/2-45/utils/build-share-record-availability-update.util';
import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';

const NOW = '2026-10-01T12:00:00.000Z';
const SHARE_RECORD_UNIVERSAL_IDENTIFIER = 'b9336f9f-d10c-42c0-b7cd-40c94ae235ef';
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
    SHARE_RECORD_UNIVERSAL_IDENTIFIER
  ];
const agentChatThread =
  allFlatEntityMaps.flatObjectMetadataMaps.byUniversalIdentifier[
    STANDARD_OBJECTS.agentChatThread.universalIdentifier
  ];

if (!isDefined(standardShareRecord) || !isDefined(agentChatThread)) {
  throw new Error('Standard Share command menu item or chat object missing');
}

const chatOnlyShareRecord: FlatCommandMenuItem = {
  ...standardShareRecord,
  conditionalAvailabilityExpression: CHAT_ONLY_EXPRESSION,
  availabilityObjectMetadataId: agentChatThread.id,
  availabilityObjectMetadataUniversalIdentifier:
    agentChatThread.universalIdentifier,
};

const buildUpdate = (
  shareRecord: FlatCommandMenuItem | undefined,
  direction: 'up' | 'down',
) =>
  buildShareRecordAvailabilityUpdate({
    flatCommandMenuItemsByUniversalIdentifier: isDefined(shareRecord)
      ? { [SHARE_RECORD_UNIVERSAL_IDENTIFIER]: shareRecord }
      : {},
    flatObjectMetadataMaps: allFlatEntityMaps.flatObjectMetadataMaps,
    now: NOW,
    direction,
  });

const isShareAvailable = ({
  featureFlags,
  objectMetadataItem,
  deletedAt = null,
  numberOfSelectedRecords = 1,
}: {
  featureFlags: Record<string, boolean>;
  objectMetadataItem: Record<string, unknown>;
  deletedAt?: string | null;
  numberOfSelectedRecords?: number;
}) =>
  evaluateConditionalAvailabilityExpression(ALL_OBJECTS_SHARE_RECORD_EXPRESSION, {
    featureFlags,
    objectMetadataItem,
    numberOfSelectedRecords,
    selectedRecords: [{ id: 'record-1', deletedAt }],
  });

describe('buildShareRecordAvailabilityUpdate', () => {
  it('matches the standard application item', () => {
    expect(standardShareRecord.conditionalAvailabilityExpression).toBe(
      ALL_OBJECTS_SHARE_RECORD_EXPRESSION,
    );
    expect(standardShareRecord.availabilityObjectMetadataId).toBeNull();
  });

  it('opens the item to every object on up', () => {
    expect(buildUpdate(chatOnlyShareRecord, 'up')).toEqual([
      {
        ...chatOnlyShareRecord,
        conditionalAvailabilityExpression: ALL_OBJECTS_SHARE_RECORD_EXPRESSION,
        availabilityObjectMetadataId: null,
        availabilityObjectMetadataUniversalIdentifier: null,
        updatedAt: NOW,
      },
    ]);
  });

  it('scopes the item back to conversations on down', () => {
    const [restored] = buildUpdate(
      {
        ...chatOnlyShareRecord,
        conditionalAvailabilityExpression: ALL_OBJECTS_SHARE_RECORD_EXPRESSION,
        availabilityObjectMetadataId: null,
        availabilityObjectMetadataUniversalIdentifier: null,
      },
      'down',
    );

    expect(restored).toMatchObject({
      conditionalAvailabilityExpression: CHAT_ONLY_EXPRESSION,
      availabilityObjectMetadataId: agentChatThread.id,
      availabilityObjectMetadataUniversalIdentifier:
        agentChatThread.universalIdentifier,
    });
  });

  it('leaves a customized or missing item alone', () => {
    expect(
      buildUpdate(
        {
          ...chatOnlyShareRecord,
          conditionalAvailabilityExpression: 'numberOfSelectedRecords == 1',
        },
        'up',
      ),
    ).toEqual([]);
    expect(buildUpdate(undefined, 'up')).toEqual([]);
  });

  describe('availability', () => {
    const company = { nameSingular: 'company', isSystem: false };
    const conversation = { nameSingular: 'agentChatThread', isSystem: true };
    const workflowRun = { nameSingular: 'workflowRun', isSystem: true };

    it('shows on any regular object once record sharing is enabled', () => {
      expect(
        isShareAvailable({
          featureFlags: { IS_RECORD_LEVEL_SHARING_ENABLED: true },
          objectMetadataItem: company,
        }),
      ).toBe(true);
    });

    it('stays off regular objects and system objects otherwise', () => {
      expect(
        isShareAvailable({ featureFlags: {}, objectMetadataItem: company }),
      ).toBe(false);
      expect(
        isShareAvailable({
          featureFlags: { IS_RECORD_LEVEL_SHARING_ENABLED: true },
          objectMetadataItem: workflowRun,
        }),
      ).toBe(false);
    });

    it.each<Record<string, boolean>>([
      { IS_AI_CHAT_SHARING_DROPDOWN_ENABLED: true },
      { IS_RECORD_LEVEL_SHARING_ENABLED: true },
    ])('keeps sharing conversations with %o', (featureFlags) => {
      expect(
        isShareAvailable({ featureFlags, objectMetadataItem: conversation }),
      ).toBe(true);
    });

    it('hides on deleted records and multiple selections', () => {
      const featureFlags = { IS_RECORD_LEVEL_SHARING_ENABLED: true };

      expect(
        isShareAvailable({
          featureFlags,
          objectMetadataItem: company,
          deletedAt: NOW,
        }),
      ).toBe(false);
      expect(
        isShareAvailable({
          featureFlags,
          objectMetadataItem: company,
          numberOfSelectedRecords: 2,
        }),
      ).toBe(false);
    });
  });
});
