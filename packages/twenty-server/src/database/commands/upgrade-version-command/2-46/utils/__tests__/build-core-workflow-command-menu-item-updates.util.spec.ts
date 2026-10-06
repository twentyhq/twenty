import {
  CORE_WORKFLOW_CONTEXT_EXPRESSION,
  CORE_WORKFLOW_FAVORITE_EXPRESSION_SUFFIX,
  LEGACY_WORKFLOW_FAVORITE_EXPRESSION_SUFFIX,
} from 'src/database/commands/upgrade-version-command/2-46/constants/legacy-workflow-object-universal-identifiers.constant';
import { buildCoreWorkflowCommandMenuItemUpdates } from 'src/database/commands/upgrade-version-command/2-46/utils/build-core-workflow-command-menu-item-updates.util';
import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type STANDARD_COMMAND_MENU_ITEMS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-command-menu-item.constant';
import { createStandardCommandMenuItemFlatMetadata } from 'src/engine/workspace-manager/twenty-standard-application/utils/command-menu-item/create-standard-command-menu-item-flat-metadata.util';

const NOW = '2026-10-06T10:00:00.000Z';
const LEGACY_WORKFLOW_OBJECT_ID = 'legacy-workflow-object-id';
const LEGACY_WORKFLOW_OBJECT_UNIVERSAL_IDENTIFIER =
  '20202020-62be-406c-b9ca-8caa50d51392';
const ACTIVATE_EXPRESSION = 'noneDefined(selectedRecords, "deletedAt")';

const buildCommandMenuItem = (
  commandMenuItemName: keyof typeof STANDARD_COMMAND_MENU_ITEMS,
  overrides: Partial<FlatCommandMenuItem>,
): FlatCommandMenuItem => ({
  ...createStandardCommandMenuItemFlatMetadata({
    commandMenuItemName,
    commandMenuItemId: `${commandMenuItemName}-id`,
    workspaceId: 'workspace-id',
    twentyStandardApplicationId: 'application-id',
    dependencyFlatEntityMaps: {
      flatObjectMetadataMaps: createEmptyFlatEntityMaps(),
    },
    now: '2026-08-01T00:00:00.000Z',
  }),
  ...overrides,
});

const LEGACY_ACTIVATE_WORKFLOW = buildCommandMenuItem('activateWorkflow', {
  availabilityObjectMetadataId: LEGACY_WORKFLOW_OBJECT_ID,
  availabilityObjectMetadataUniversalIdentifier:
    LEGACY_WORKFLOW_OBJECT_UNIVERSAL_IDENTIFIER,
  conditionalAvailabilityExpression: ACTIVATE_EXPRESSION,
});

const LEGACY_ADD_TO_FAVORITES = buildCommandMenuItem('addToFavorites', {
  conditionalAvailabilityExpression: `arrayLength(favoriteRecordIds) < numberOfSelectedRecords${LEGACY_WORKFLOW_FAVORITE_EXPRESSION_SUFFIX}`,
});

const toRecord = (commandMenuItems: FlatCommandMenuItem[]) =>
  Object.fromEntries(
    commandMenuItems.map((commandMenuItem) => [
      commandMenuItem.universalIdentifier,
      commandMenuItem,
    ]),
  );

describe('buildCoreWorkflowCommandMenuItemUpdates', () => {
  it('detaches workflow commands from the legacy object and gates them on the core workflow context', () => {
    expect(
      buildCoreWorkflowCommandMenuItemUpdates({
        flatCommandMenuItemsByUniversalIdentifier: toRecord([
          LEGACY_ACTIVATE_WORKFLOW,
        ]),
        now: NOW,
      }),
    ).toEqual([
      {
        ...LEGACY_ACTIVATE_WORKFLOW,
        availabilityObjectMetadataId: null,
        availabilityObjectMetadataUniversalIdentifier: null,
        conditionalAvailabilityExpression: `${CORE_WORKFLOW_CONTEXT_EXPRESSION} and ${ACTIVATE_EXPRESSION}`,
        updatedAt: NOW,
      },
    ]);
  });

  it('uses the core workflow context alone when the command had no expression', () => {
    const [update] = buildCoreWorkflowCommandMenuItemUpdates({
      flatCommandMenuItemsByUniversalIdentifier: toRecord([
        {
          ...LEGACY_ACTIVATE_WORKFLOW,
          conditionalAvailabilityExpression: null,
        },
      ]),
      now: NOW,
    });

    expect(update.conditionalAvailabilityExpression).toBe(
      CORE_WORKFLOW_CONTEXT_EXPRESSION,
    );
  });

  it('replaces the flag-gated favorite suffix with the core workflow exclusion', () => {
    const [update] = buildCoreWorkflowCommandMenuItemUpdates({
      flatCommandMenuItemsByUniversalIdentifier: toRecord([
        LEGACY_ADD_TO_FAVORITES,
      ]),
      now: NOW,
    });

    expect(update.conditionalAvailabilityExpression).toBe(
      `arrayLength(favoriteRecordIds) < numberOfSelectedRecords${CORE_WORKFLOW_FAVORITE_EXPRESSION_SUFFIX}`,
    );
    expect(update.updatedAt).toBe(NOW);
  });

  it('returns nothing once the commands are re-homed', () => {
    const [rehomedActivateWorkflow, rehomedAddToFavorites] =
      buildCoreWorkflowCommandMenuItemUpdates({
        flatCommandMenuItemsByUniversalIdentifier: toRecord([
          LEGACY_ACTIVATE_WORKFLOW,
          LEGACY_ADD_TO_FAVORITES,
        ]),
        now: NOW,
      });

    expect(
      buildCoreWorkflowCommandMenuItemUpdates({
        flatCommandMenuItemsByUniversalIdentifier: toRecord([
          rehomedActivateWorkflow,
          rehomedAddToFavorites,
        ]),
        now: NOW,
      }),
    ).toEqual([]);
  });

  it('skips commands the workspace does not have', () => {
    expect(
      buildCoreWorkflowCommandMenuItemUpdates({
        flatCommandMenuItemsByUniversalIdentifier: {},
        now: NOW,
      }),
    ).toEqual([]);
  });
});
