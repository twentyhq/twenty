import { isDefined } from 'twenty-shared/utils';

import { buildChatCommandMenuItemAvailabilityUpdates } from 'src/database/commands/upgrade-version-command/2-44/utils/build-chat-command-menu-item-availability-updates.util';
import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';

const NOW = '2026-09-29T12:00:00.000Z';
const ASK_AI_UNIVERSAL_IDENTIFIER = 'ce5fb54d-2b19-4dd1-b7b4-9532a1761a41';
const NAVIGATE_TO_NEXT_RECORD_UNIVERSAL_IDENTIFIER =
  '3db2457d-8e96-4b8e-94c9-ed95d3f95738';
const PREVIOUS_ASK_AI_EXPRESSION = 'permissionFlags.AI and not isInSidePanel';

const { allFlatEntityMaps } = computeTwentyStandardApplicationAllFlatEntityMaps(
  {
    now: '2026-09-27T12:00:00.000Z',
    workspaceId: '20202020-1111-4111-8111-111111111111',
    twentyStandardApplicationId: '20202020-2222-4222-8222-222222222222',
  },
);

const getStandardItem = (universalIdentifier: string): FlatCommandMenuItem => {
  const commandMenuItem =
    allFlatEntityMaps.flatCommandMenuItemMaps.byUniversalIdentifier[
      universalIdentifier
    ];

  if (!isDefined(commandMenuItem)) {
    throw new Error(
      `Standard command menu item ${universalIdentifier} missing`,
    );
  }

  return commandMenuItem;
};

describe('buildChatCommandMenuItemAvailabilityUpdates', () => {
  it('moves the previous expressions to the current standard ones', () => {
    const askAi = getStandardItem(ASK_AI_UNIVERSAL_IDENTIFIER);

    const updates = buildChatCommandMenuItemAvailabilityUpdates({
      flatCommandMenuItemsByUniversalIdentifier: {
        [ASK_AI_UNIVERSAL_IDENTIFIER]: {
          ...askAi,
          conditionalAvailabilityExpression: PREVIOUS_ASK_AI_EXPRESSION,
        },
      },
      now: NOW,
      direction: 'up',
    });

    expect(updates).toEqual([
      expect.objectContaining({
        universalIdentifier: ASK_AI_UNIVERSAL_IDENTIFIER,
        conditionalAvailabilityExpression:
          askAi.conditionalAvailabilityExpression,
        updatedAt: NOW,
      }),
    ]);
  });

  it('leaves customized and already migrated expressions alone', () => {
    const navigateToNextRecord = getStandardItem(
      NAVIGATE_TO_NEXT_RECORD_UNIVERSAL_IDENTIFIER,
    );

    expect(
      buildChatCommandMenuItemAvailabilityUpdates({
        flatCommandMenuItemsByUniversalIdentifier: {
          [NAVIGATE_TO_NEXT_RECORD_UNIVERSAL_IDENTIFIER]: navigateToNextRecord,
          [ASK_AI_UNIVERSAL_IDENTIFIER]: {
            ...getStandardItem(ASK_AI_UNIVERSAL_IDENTIFIER),
            conditionalAvailabilityExpression: 'permissionFlags.AI',
          },
        },
        now: NOW,
        direction: 'up',
      }),
    ).toEqual([]);
  });

  it('restores the previous expressions on down', () => {
    const updates = buildChatCommandMenuItemAvailabilityUpdates({
      flatCommandMenuItemsByUniversalIdentifier: {
        [ASK_AI_UNIVERSAL_IDENTIFIER]: getStandardItem(
          ASK_AI_UNIVERSAL_IDENTIFIER,
        ),
      },
      now: NOW,
      direction: 'down',
    });

    expect(updates).toEqual([
      expect.objectContaining({
        conditionalAvailabilityExpression: PREVIOUS_ASK_AI_EXPRESSION,
      }),
    ]);
  });
});
