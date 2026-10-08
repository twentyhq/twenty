import { buildGateWorkflowVersionNavigationCommandMenuItemUpdate } from 'src/database/commands/upgrade-version-command/2-38/utils/build-gate-workflow-version-navigation-command-menu-item-update.util';
import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { createStandardCommandMenuItemFlatMetadata } from 'src/engine/workspace-manager/twenty-standard-application/utils/command-menu-item/create-standard-command-menu-item-flat-metadata.util';

const NOW = '2026-09-01T12:00:00.000Z';
const GATED_EXPRESSION =
  'not featureFlags.IS_WORKFLOW_CORE_INDEX_PAGE_ENABLED and targetObjectReadPermissions.workflowVersion';

const LEGACY_COMMAND_MENU_ITEM: FlatCommandMenuItem = Object.freeze({
  ...createStandardCommandMenuItemFlatMetadata({
    commandMenuItemName: 'askAi',
    commandMenuItemId: 'workflow-version-navigation-command-id',
    workspaceId: 'workspace-id',
    twentyStandardApplicationId: 'application-id',
    dependencyFlatEntityMaps: {
      flatObjectMetadataMaps: createEmptyFlatEntityMaps(),
    },
    now: '2026-08-01T00:00:00.000Z',
  }),
  conditionalAvailabilityExpression: 'targetObjectReadPermissions.workflowVersion',
});

describe('buildGateWorkflowVersionNavigationCommandMenuItemUpdate', () => {
  it('gates the legacy navigation expression behind the flag being off', () => {
    expect(
      buildGateWorkflowVersionNavigationCommandMenuItemUpdate({
        existingCommandMenuItem: LEGACY_COMMAND_MENU_ITEM,
        conditionalAvailabilityExpression: GATED_EXPRESSION,
        now: NOW,
      }),
    ).toEqual({
      ...LEGACY_COMMAND_MENU_ITEM,
      conditionalAvailabilityExpression: GATED_EXPRESSION,
      updatedAt: NOW,
    });
  });

  it.each([
    { name: 'missing command', existingCommandMenuItem: undefined },
    {
      name: 'already gated command',
      existingCommandMenuItem: {
        ...LEGACY_COMMAND_MENU_ITEM,
        conditionalAvailabilityExpression: GATED_EXPRESSION,
      },
    },
    {
      name: 'customized expression',
      existingCommandMenuItem: {
        ...LEGACY_COMMAND_MENU_ITEM,
        conditionalAvailabilityExpression:
          'targetObjectReadPermissions.workflowVersion and objectPermissions.canReadObjectRecords',
      },
    },
  ])('skips $name', ({ existingCommandMenuItem }) => {
    expect(
      buildGateWorkflowVersionNavigationCommandMenuItemUpdate({
        existingCommandMenuItem,
        conditionalAvailabilityExpression: GATED_EXPRESSION,
        now: NOW,
      }),
    ).toBeUndefined();
  });
});
