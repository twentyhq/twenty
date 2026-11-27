import { buildInboxCommandMenuItemExpressionUpdates } from 'src/database/commands/upgrade-version-command/2-66/utils/build-inbox-command-menu-item-expression-updates.util';
import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { createStandardCommandMenuItemFlatMetadata } from 'src/engine/workspace-manager/twenty-standard-application/utils/command-menu-item/create-standard-command-menu-item-flat-metadata.util';

const NOW = '2026-11-27T12:00:00.000Z';

const buildFlatCommandMenuItem = (
  overrides: Pick<
    FlatCommandMenuItem,
    | 'id'
    | 'universalIdentifier'
    | 'conditionalAvailabilityExpression'
    | 'conditionalPinnedExpression'
  >,
): FlatCommandMenuItem => ({
  ...createStandardCommandMenuItemFlatMetadata({
    commandMenuItemName: 'askAi',
    commandMenuItemId: overrides.id,
    workspaceId: '20202020-1111-4111-8111-111111111111',
    twentyStandardApplicationId: '20202020-2222-4222-8222-222222222222',
    dependencyFlatEntityMaps: {
      flatObjectMetadataMaps: createEmptyFlatEntityMaps(),
    },
    now: '2026-08-01T00:00:00.000Z',
  }),
  ...overrides,
});

const buildFlatCommandMenuItemMaps = (
  flatCommandMenuItems: FlatCommandMenuItem[],
) =>
  flatCommandMenuItems.reduce<FlatEntityMaps<FlatCommandMenuItem>>(
    (flatEntityMaps, flatEntity) =>
      addFlatEntityToFlatEntityMapsOrThrow({ flatEntity, flatEntityMaps }),
    createEmptyFlatEntityMaps(),
  );

describe('buildInboxCommandMenuItemExpressionUpdates', () => {
  it('rewrites each agent chat object name without touching a longer name that starts with it', () => {
    const flatCommandMenuItem = buildFlatCommandMenuItem({
      id: '20202020-3333-4333-8333-333333333331',
      universalIdentifier: '20202020-4444-4444-8444-444444444441',
      conditionalAvailabilityExpression:
        'targetObjectReadPermissions.agentChatThreadParticipant and objectMetadataItem.nameSingular != "agentChatThread"',
      conditionalPinnedExpression:
        'objectMetadataItem.nameSingular == "agentChatThread" and not isInSidePanel',
    });

    expect(
      buildInboxCommandMenuItemExpressionUpdates({
        flatCommandMenuItemMaps: buildFlatCommandMenuItemMaps([
          flatCommandMenuItem,
        ]),
        now: NOW,
      }),
    ).toEqual([
      {
        ...flatCommandMenuItem,
        conditionalAvailabilityExpression:
          'targetObjectReadPermissions.inboxThreadParticipant and objectMetadataItem.nameSingular != "inboxThread"',
        conditionalPinnedExpression:
          'objectMetadataItem.nameSingular == "inboxThread" and not isInSidePanel',
        updatedAt: NOW,
      },
    ]);
  });

  it('leaves command menu items without an agent chat object name alone', () => {
    expect(
      buildInboxCommandMenuItemExpressionUpdates({
        flatCommandMenuItemMaps: buildFlatCommandMenuItemMaps([
          buildFlatCommandMenuItem({
            id: '20202020-3333-4333-8333-333333333332',
            universalIdentifier: '20202020-4444-4444-8444-444444444442',
            conditionalAvailabilityExpression:
              'objectMetadataItem.nameSingular != "inboxThread" and targetObjectReadPermissions.agentTurn',
            conditionalPinnedExpression: null,
          }),
        ]),
        now: NOW,
      }),
    ).toEqual([]);
  });
});
