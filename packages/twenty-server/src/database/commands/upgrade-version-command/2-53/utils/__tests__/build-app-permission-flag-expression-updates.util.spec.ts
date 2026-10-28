import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { CommandMenuItemAvailabilityType } from 'twenty-shared/types';

import { buildAppPermissionFlagExpressionUpdates } from 'src/database/commands/upgrade-version-command/2-53/utils/build-app-permission-flag-expression-updates.util';
import { EngineComponentKey } from 'src/engine/metadata-modules/command-menu-item/enums/engine-component-key.enum';
import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';

const NOW = '2026-10-28T12:00:00.000Z';

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
}): FlatCommandMenuItem => ({
  id: `id-${universalIdentifier}`,
  universalIdentifier,
  conditionalAvailabilityExpression,
  conditionalPinnedExpression,
  applicationUniversalIdentifier,
  workspaceId: 'workspace-id',
  applicationId: `application-id-${applicationUniversalIdentifier}`,
  label: 'Command menu item',
  shortLabel: null,
  icon: null,
  position: 0,
  isPinned: false,
  isActive: true,
  isSystemSideEffect: false,
  engineComponentKey: EngineComponentKey.TRIGGER_WORKFLOW_VERSION,
  availabilityType: CommandMenuItemAvailabilityType.GLOBAL,
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
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
});

const buildUpdates = (
  commandMenuItems: FlatCommandMenuItem[],
  direction: 'up' | 'down' = 'up',
) =>
  buildAppPermissionFlagExpressionUpdates({
    flatCommandMenuItemByUniversalIdentifier: Object.fromEntries(
      commandMenuItems.map((commandMenuItem) => [
        commandMenuItem.universalIdentifier,
        commandMenuItem,
      ]),
    ),
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

const renameExpression = ({
  conditionalAvailabilityExpression,
  direction,
}: {
  conditionalAvailabilityExpression: string;
  direction: 'up' | 'down';
}) =>
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
    expect(
      renameExpression({
        conditionalAvailabilityExpression: 'permissionFlags.USER_APPS',
        direction: 'down',
      }),
    ).toBe('permissionFlags.CONNECTED_ACCOUNTS');
    expect(
      renameExpression({
        conditionalAvailabilityExpression: 'permissionFlags.WORKSPACE_APPS',
        direction: 'down',
      }),
    ).toBe('permissionFlags.APPLICATIONS');
  });

  it('renames every whole reference inside a compound expression', () => {
    expect(
      renameExpression({
        conditionalAvailabilityExpression:
          'not isInSidePanel and (permissionFlags.APPLICATIONS or permissionFlags.CONNECTED_ACCOUNTS)',
        direction: 'up',
      }),
    ).toBe(
      'not isInSidePanel and (permissionFlags.WORKSPACE_APPS or permissionFlags.USER_APPS)',
    );
  });

  it('leaves references that only share a prefix with the old keys', () => {
    expect(
      renameExpression({
        conditionalAvailabilityExpression:
          'permissionFlags.APPLICATIONS_ADMIN and context.permissionFlags.CONNECTED_ACCOUNTS and permissionFlags.AI',
        direction: 'up',
      }),
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
      nonStandardCommandMenuItemsToUpdate: [],
    });
  });

  it('separates the items of other applications from the standard ones', () => {
    const {
      standardCommandMenuItemsToUpdate,
      nonStandardCommandMenuItemsToUpdate,
    } = buildUpdates([
      buildCommandMenuItem({
        universalIdentifier: 'other-application',
        conditionalAvailabilityExpression: 'permissionFlags.CONNECTED_ACCOUNTS',
        applicationUniversalIdentifier: OTHER_APPLICATION_UNIVERSAL_IDENTIFIER,
      }),
    ]);

    expect(standardCommandMenuItemsToUpdate).toEqual([]);
    expect(
      nonStandardCommandMenuItemsToUpdate.map(
        ({ universalIdentifier, conditionalAvailabilityExpression }) => ({
          universalIdentifier,
          conditionalAvailabilityExpression,
        }),
      ),
    ).toEqual([
      {
        universalIdentifier: 'other-application',
        conditionalAvailabilityExpression: 'permissionFlags.USER_APPS',
      },
    ]);
  });
});
