import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';

import { type AppPermissionFlagKeyRenameDirection } from 'src/database/commands/upgrade-version-command/2-53/types/app-permission-flag-key-rename-direction.type';
import { buildAppPermissionFlagExpressionUpdates } from 'src/database/commands/upgrade-version-command/2-53/utils/build-app-permission-flag-expression-updates.util';
import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';

const NOW = '2026-10-28T12:00:00.000Z';

const WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER =
  '20202020-5555-4555-8555-555555555555';

const OTHER_APPLICATION_UNIVERSAL_IDENTIFIER =
  '20202020-3333-4333-8333-333333333333';

const PREVIOUS_EXPRESSION_BY_STANDARD_COMMAND_MENU_ITEM_UNIVERSAL_IDENTIFIER = {
  '447a65cc-8535-408e-9c48-db24affb7530': 'permissionFlags.CONNECTED_ACCOUNTS',
  '4feab22c-165f-4d13-81ca-c9eb6082ca50': 'permissionFlags.CONNECTED_ACCOUNTS',
  '3267ec0e-9dee-4d9b-8f1b-6005bfd90202': 'permissionFlags.CONNECTED_ACCOUNTS',
  '44db6d7a-79ac-485e-b3da-da8776bd7777': 'permissionFlags.APPLICATIONS',
};

const buildCommandMenuItem = ({
  universalIdentifier,
  conditionalAvailabilityExpression,
  conditionalPinnedExpression = null,
  applicationUniversalIdentifier = TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
}: {
  universalIdentifier: string;
  conditionalAvailabilityExpression: string | null;
  conditionalPinnedExpression?: string | null;
  applicationUniversalIdentifier?: string;
}): FlatCommandMenuItem =>
  ({
    universalIdentifier,
    conditionalAvailabilityExpression,
    conditionalPinnedExpression,
    applicationUniversalIdentifier,
    updatedAt: '2026-01-01T00:00:00.000Z',
  }) as FlatCommandMenuItem;

const buildUpdates = (
  commandMenuItems: FlatCommandMenuItem[],
  direction: AppPermissionFlagKeyRenameDirection = 'up',
) =>
  buildAppPermissionFlagExpressionUpdates({
    flatCommandMenuItemByUniversalIdentifier: Object.fromEntries(
      commandMenuItems.map((commandMenuItem) => [
        commandMenuItem.universalIdentifier,
        commandMenuItem,
      ]),
    ),
    workspaceCustomApplicationUniversalIdentifier:
      WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
    now: NOW,
    direction,
  });

const buildPreviousStandardCommandMenuItems = () =>
  Object.entries(
    PREVIOUS_EXPRESSION_BY_STANDARD_COMMAND_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  ).map(([universalIdentifier, conditionalAvailabilityExpression]) =>
    buildCommandMenuItem({
      universalIdentifier,
      conditionalAvailabilityExpression,
    }),
  );

const renameExpression = (
  conditionalAvailabilityExpression: string,
  direction: AppPermissionFlagKeyRenameDirection,
) =>
  buildUpdates(
    [
      buildCommandMenuItem({
        universalIdentifier: 'command-menu-item',
        conditionalAvailabilityExpression,
      }),
    ],
    direction,
  ).standardCommandMenuItemsToUpdate[0]?.conditionalAvailabilityExpression;

describe('buildAppPermissionFlagExpressionUpdates', () => {
  it('produces the expressions the standard application now declares', () => {
    const { allFlatEntityMaps } =
      computeTwentyStandardApplicationAllFlatEntityMaps({
        now: NOW,
        workspaceId: '20202020-1111-4111-8111-111111111111',
        twentyStandardApplicationId: '20202020-2222-4222-8222-222222222222',
      });

    const { standardCommandMenuItemsToUpdate } = buildUpdates(
      buildPreviousStandardCommandMenuItems(),
    );

    expect(standardCommandMenuItemsToUpdate).toHaveLength(4);

    for (const {
      universalIdentifier,
      conditionalAvailabilityExpression,
    } of standardCommandMenuItemsToUpdate) {
      expect(conditionalAvailabilityExpression).toBe(
        allFlatEntityMaps.flatCommandMenuItemMaps.byUniversalIdentifier[
          universalIdentifier
        ]?.conditionalAvailabilityExpression,
      );
    }
  });

  it('rewrites the standard command menu items on up', () => {
    const { standardCommandMenuItemsToUpdate } = buildUpdates(
      buildPreviousStandardCommandMenuItems(),
    );

    expect(
      standardCommandMenuItemsToUpdate.map(
        ({ universalIdentifier, conditionalAvailabilityExpression }) => ({
          universalIdentifier,
          conditionalAvailabilityExpression,
        }),
      ),
    ).toEqual([
      {
        universalIdentifier: '447a65cc-8535-408e-9c48-db24affb7530',
        conditionalAvailabilityExpression: 'permissionFlags.USER_APPS',
      },
      {
        universalIdentifier: '4feab22c-165f-4d13-81ca-c9eb6082ca50',
        conditionalAvailabilityExpression: 'permissionFlags.USER_APPS',
      },
      {
        universalIdentifier: '3267ec0e-9dee-4d9b-8f1b-6005bfd90202',
        conditionalAvailabilityExpression: 'permissionFlags.USER_APPS',
      },
      {
        universalIdentifier: '44db6d7a-79ac-485e-b3da-da8776bd7777',
        conditionalAvailabilityExpression: 'permissionFlags.WORKSPACE_APPS',
      },
    ]);
    expect(
      standardCommandMenuItemsToUpdate.every(
        ({ updatedAt }) => updatedAt === NOW,
      ),
    ).toBe(true);
  });

  it('restores the previous expressions on down', () => {
    expect(renameExpression('permissionFlags.USER_APPS', 'down')).toBe(
      'permissionFlags.CONNECTED_ACCOUNTS',
    );
    expect(renameExpression('permissionFlags.WORKSPACE_APPS', 'down')).toBe(
      'permissionFlags.APPLICATIONS',
    );
  });

  it('renames every whole reference inside a compound expression', () => {
    expect(
      renameExpression(
        'not isInSidePanel and (permissionFlags.APPLICATIONS or permissionFlags.CONNECTED_ACCOUNTS)',
        'up',
      ),
    ).toBe(
      'not isInSidePanel and (permissionFlags.WORKSPACE_APPS or permissionFlags.USER_APPS)',
    );
  });

  it('leaves references that only share a prefix with the old keys', () => {
    expect(
      renameExpression(
        'permissionFlags.APPLICATIONS_ADMIN and context.permissionFlags.CONNECTED_ACCOUNTS and permissionFlags.AI',
        'up',
      ),
    ).toBeUndefined();
  });

  it('rewrites the pinned expression alongside the availability expression', () => {
    const { standardCommandMenuItemsToUpdate } = buildUpdates([
      buildCommandMenuItem({
        universalIdentifier: 'pinned-only',
        conditionalAvailabilityExpression: 'permissionFlags.AI',
        conditionalPinnedExpression: 'permissionFlags.APPLICATIONS',
      }),
    ]);

    expect(standardCommandMenuItemsToUpdate).toMatchObject([
      {
        conditionalAvailabilityExpression: 'permissionFlags.AI',
        conditionalPinnedExpression: 'permissionFlags.WORKSPACE_APPS',
      },
    ]);
  });

  it('skips items already renamed or without an expression', () => {
    expect(
      buildUpdates([
        buildCommandMenuItem({
          universalIdentifier: 'renamed',
          conditionalAvailabilityExpression: 'permissionFlags.USER_APPS',
          conditionalPinnedExpression: 'permissionFlags.WORKSPACE_APPS',
        }),
        buildCommandMenuItem({
          universalIdentifier: 'without-expression',
          conditionalAvailabilityExpression: null,
        }),
      ]),
    ).toEqual({
      standardCommandMenuItemsToUpdate: [],
      customCommandMenuItemsToUpdate: [],
      skippedCommandMenuItemCount: 0,
    });
  });

  it('separates workspace custom items and counts items of other applications without rewriting them', () => {
    const { customCommandMenuItemsToUpdate, skippedCommandMenuItemCount } =
      buildUpdates([
        buildCommandMenuItem({
          universalIdentifier: 'custom',
          conditionalAvailabilityExpression:
            'permissionFlags.CONNECTED_ACCOUNTS',
          applicationUniversalIdentifier:
            WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
        }),
        buildCommandMenuItem({
          universalIdentifier: 'other-application',
          conditionalAvailabilityExpression:
            'permissionFlags.CONNECTED_ACCOUNTS',
          applicationUniversalIdentifier:
            OTHER_APPLICATION_UNIVERSAL_IDENTIFIER,
        }),
      ]);

    expect(
      customCommandMenuItemsToUpdate.map(
        ({ universalIdentifier, conditionalAvailabilityExpression }) => ({
          universalIdentifier,
          conditionalAvailabilityExpression,
        }),
      ),
    ).toEqual([
      {
        universalIdentifier: 'custom',
        conditionalAvailabilityExpression: 'permissionFlags.USER_APPS',
      },
    ]);
    expect(skippedCommandMenuItemCount).toBe(1);
  });
});
