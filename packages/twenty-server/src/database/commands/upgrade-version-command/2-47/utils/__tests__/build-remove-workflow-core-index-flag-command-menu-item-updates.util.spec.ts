import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { buildRemoveWorkflowCoreIndexFlagCommandMenuItemUpdates } from 'src/database/commands/upgrade-version-command/2-47/utils/build-remove-workflow-core-index-flag-command-menu-item-updates.util';
import { EngineComponentKey } from 'src/engine/metadata-modules/command-menu-item/enums/engine-component-key.enum';
import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';

const NOW = '2026-10-12T12:00:00.000Z';
const FLAG = 'featureFlags.IS_WORKFLOW_CORE_INDEX_PAGE_ENABLED';
const ADD_TO_FAVORITES_UNIVERSAL_IDENTIFIER =
  '38bf80c3-bd55-4753-80ba-38aa66429a03';
const REMOVE_FROM_FAVORITES_UNIVERSAL_IDENTIFIER =
  '3ea42507-44fa-4895-a36d-cbfef7355a50';

const { allFlatEntityMaps } = computeTwentyStandardApplicationAllFlatEntityMaps(
  {
    now: '2026-10-01T12:00:00.000Z',
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

const withFlaggedFavoritesExpression = (
  commandMenuItem: FlatCommandMenuItem,
): FlatCommandMenuItem => ({
  ...commandMenuItem,
  conditionalAvailabilityExpression:
    commandMenuItem.conditionalAvailabilityExpression?.replace(
      ' and objectMetadataItem.nameSingular != "workflow"',
      ` and not (${FLAG} and objectMetadataItem.nameSingular == "workflow")`,
    ) ?? null,
});

const buildItem = (
  overrides: Partial<FlatCommandMenuItem>,
): FlatCommandMenuItem => ({
  ...getStandardItem(ADD_TO_FAVORITES_UNIVERSAL_IDENTIFIER),
  ...overrides,
});

const WORKFLOW_VERSION_NAVIGATION_ITEM = buildItem({
  universalIdentifier: 'workflow-version-navigation',
  engineComponentKey: EngineComponentKey.NAVIGATION,
  navigationTargetObjectMetadataUniversalIdentifier:
    STANDARD_OBJECTS.workflowVersion.universalIdentifier,
  conditionalAvailabilityExpression: `not ${FLAG} and targetObjectReadPermissions.workflowVersion`,
});

const APPLICATION_WORKFLOW_ITEM = buildItem({
  universalIdentifier: 'application-workflow',
  applicationUniversalIdentifier: 'application',
  engineComponentKey: EngineComponentKey.TRIGGER_WORKFLOW_VERSION,
  isSystemSideEffect: true,
  conditionalAvailabilityExpression: FLAG,
});

const updateUp = (flatCommandMenuItems: FlatCommandMenuItem[]) =>
  buildRemoveWorkflowCoreIndexFlagCommandMenuItemUpdates({
    flatCommandMenuItems,
    now: NOW,
    direction: 'up',
  });

describe('buildRemoveWorkflowCoreIndexFlagCommandMenuItemUpdates', () => {
  it('moves the favorites commands to the current standard expressions', () => {
    const favoritesItems = [
      ADD_TO_FAVORITES_UNIVERSAL_IDENTIFIER,
      REMOVE_FROM_FAVORITES_UNIVERSAL_IDENTIFIER,
    ].map(getStandardItem);

    const updates = updateUp(
      favoritesItems.map(withFlaggedFavoritesExpression),
    );

    expect(
      updates.map(
        ({ conditionalAvailabilityExpression }) =>
          conditionalAvailabilityExpression,
      ),
    ).toEqual(
      favoritesItems.map(
        ({ conditionalAvailabilityExpression }) =>
          conditionalAvailabilityExpression,
      ),
    );
    expect(updates.every(({ updatedAt }) => updatedAt === NOW)).toBe(true);
  });

  it('hides the workflow versions navigation', () => {
    expect(updateUp([WORKFLOW_VERSION_NAVIGATION_ITEM])).toMatchObject([
      { conditionalAvailabilityExpression: 'false' },
    ]);
  });

  it('drops the condition of application workflow commands', () => {
    expect(updateUp([APPLICATION_WORKFLOW_ITEM])).toMatchObject([
      {
        universalIdentifier: 'application-workflow',
        conditionalAvailabilityExpression: null,
      },
    ]);
  });

  it('treats the flag as enabled in any other expression', () => {
    expect(
      updateUp([
        buildItem({
          conditionalAvailabilityExpression: `numberOfSelectedRecords == 1 and ${FLAG}`,
        }),
      ]),
    ).toMatchObject([
      {
        conditionalAvailabilityExpression:
          'numberOfSelectedRecords == 1 and true',
      },
    ]);
  });

  it('leaves expressions without the flag untouched', () => {
    expect(
      updateUp([
        getStandardItem(ADD_TO_FAVORITES_UNIVERSAL_IDENTIFIER),
        buildItem({ conditionalAvailabilityExpression: null }),
      ]),
    ).toEqual([]);
  });

  it('restores the flagged standard expressions on down', () => {
    const favoritesItem = getStandardItem(
      ADD_TO_FAVORITES_UNIVERSAL_IDENTIFIER,
    );
    const hiddenNavigationItem = {
      ...WORKFLOW_VERSION_NAVIGATION_ITEM,
      conditionalAvailabilityExpression: 'false',
    };

    const updates = buildRemoveWorkflowCoreIndexFlagCommandMenuItemUpdates({
      flatCommandMenuItems: [
        favoritesItem,
        hiddenNavigationItem,
        buildItem({ conditionalAvailabilityExpression: 'false' }),
        {
          ...APPLICATION_WORKFLOW_ITEM,
          conditionalAvailabilityExpression: null,
        },
        {
          ...APPLICATION_WORKFLOW_ITEM,
          universalIdentifier: 'user-workflow',
          isSystemSideEffect: false,
          conditionalAvailabilityExpression: null,
        },
      ],
      now: NOW,
      direction: 'down',
    });

    expect(
      updates.map(
        ({ conditionalAvailabilityExpression }) =>
          conditionalAvailabilityExpression,
      ),
    ).toEqual([
      withFlaggedFavoritesExpression(favoritesItem)
        .conditionalAvailabilityExpression,
      WORKFLOW_VERSION_NAVIGATION_ITEM.conditionalAvailabilityExpression,
      FLAG,
    ]);
  });
});
