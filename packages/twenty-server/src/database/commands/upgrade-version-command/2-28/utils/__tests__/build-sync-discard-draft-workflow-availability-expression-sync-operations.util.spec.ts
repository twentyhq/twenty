import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';

import {
  buildSyncDiscardDraftWorkflowAvailabilityExpressionSyncOperations,
  LEGACY_DISCARD_DRAFT_WORKFLOW_AVAILABILITY_EXPRESSION,
} from 'src/database/commands/upgrade-version-command/2-28/utils/build-sync-discard-draft-workflow-availability-expression-sync-operations.util';
import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { STANDARD_COMMAND_MENU_ITEMS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-command-menu-item.constant';

const APPLICATION_ID = 'application-id';
const WORKSPACE_ID = 'workspace-id';
const CREATED_AT = '2026-08-01T00:00:00.000Z';
const NOW = '2026-08-04T00:00:00.000Z';

const DISCARD_DRAFT_WORKFLOW_DEFINITION =
  STANDARD_COMMAND_MENU_ITEMS.discardDraftWorkflow;

// Independent literal so a regression in the standard definition is caught here
// rather than silently accepted by asserting the value against itself.
const EXPECTED_DISCARD_DRAFT_WORKFLOW_AVAILABILITY_EXPRESSION =
  'every(selectedRecords, "lastPublishedVersionId") and everyEquals(selectedRecords, "currentVersion.status", "DRAFT") and noneDefined(selectedRecords, "deletedAt")';

const buildFlatCommandMenuItemMaps = (
  flatCommandMenuItems: FlatCommandMenuItem[],
): FlatEntityMaps<FlatCommandMenuItem> => ({
  byUniversalIdentifier: Object.fromEntries(
    flatCommandMenuItems.map((flatCommandMenuItem) => [
      flatCommandMenuItem.universalIdentifier,
      flatCommandMenuItem,
    ]),
  ),
  universalIdentifierById: Object.fromEntries(
    flatCommandMenuItems.map((flatCommandMenuItem) => [
      flatCommandMenuItem.id,
      flatCommandMenuItem.universalIdentifier,
    ]),
  ),
  universalIdentifiersByApplicationId: {
    [APPLICATION_ID]: flatCommandMenuItems.map(
      (flatCommandMenuItem) => flatCommandMenuItem.universalIdentifier,
    ),
  },
});

const buildDiscardDraftWorkflowCommandMenuItem = ({
  conditionalAvailabilityExpression,
}: {
  conditionalAvailabilityExpression: string | null;
}): FlatCommandMenuItem => ({
  id: 'discard-draft-workflow-command-menu-item-id',
  universalIdentifier: DISCARD_DRAFT_WORKFLOW_DEFINITION.universalIdentifier,
  applicationId: APPLICATION_ID,
  applicationUniversalIdentifier:
    TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
  workspaceId: WORKSPACE_ID,
  label: DISCARD_DRAFT_WORKFLOW_DEFINITION.label,
  shortLabel: DISCARD_DRAFT_WORKFLOW_DEFINITION.shortLabel,
  icon: DISCARD_DRAFT_WORKFLOW_DEFINITION.icon,
  position: DISCARD_DRAFT_WORKFLOW_DEFINITION.position,
  isPinned: DISCARD_DRAFT_WORKFLOW_DEFINITION.isPinned,
  availabilityType: DISCARD_DRAFT_WORKFLOW_DEFINITION.availabilityType,
  conditionalAvailabilityExpression,
  frontComponentId: null,
  frontComponentUniversalIdentifier: null,
  engineComponentKey: DISCARD_DRAFT_WORKFLOW_DEFINITION.engineComponentKey,
  payload: null,
  hotKeys: null,
  workflowVersionId: null,
  availabilityObjectMetadataId: 'workflow-object-metadata-id',
  availabilityObjectMetadataUniversalIdentifier:
    DISCARD_DRAFT_WORKFLOW_DEFINITION.availabilityObjectMetadataUniversalIdentifier,
  pageLayoutId: null,
  pageLayoutUniversalIdentifier: null,
  isActive: true,
  isSystemSideEffect: false,
  overrides: null,
  universalOverrides: null,
  createdAt: CREATED_AT,
  updatedAt: CREATED_AT,
});

describe('buildSyncDiscardDraftWorkflowAvailabilityExpressionSyncOperations', () => {
  it('rewrites the legacy versions.length gate to the lastPublishedVersionId gate', () => {
    const legacyDiscardDraftWorkflowCommandMenuItem =
      buildDiscardDraftWorkflowCommandMenuItem({
        conditionalAvailabilityExpression:
          LEGACY_DISCARD_DRAFT_WORKFLOW_AVAILABILITY_EXPRESSION,
      });

    const result =
      buildSyncDiscardDraftWorkflowAvailabilityExpressionSyncOperations({
        existingFlatCommandMenuItemMaps: buildFlatCommandMenuItemMaps([
          legacyDiscardDraftWorkflowCommandMenuItem,
        ]),
        now: NOW,
      });

    expect(result.flatEntityToCreate).toHaveLength(0);
    expect(result.flatEntityToDelete).toHaveLength(0);
    expect(result.flatEntityToUpdate).toHaveLength(1);
    expect(result.flatEntityToUpdate[0]).toMatchObject({
      id: legacyDiscardDraftWorkflowCommandMenuItem.id,
      conditionalAvailabilityExpression:
        EXPECTED_DISCARD_DRAFT_WORKFLOW_AVAILABILITY_EXPRESSION,
      updatedAt: NOW,
    });
  });

  it('syncs to the lastPublishedVersionId gate defined in the standard command menu item', () => {
    expect(
      DISCARD_DRAFT_WORKFLOW_DEFINITION.conditionalAvailabilityExpression,
    ).toBe(EXPECTED_DISCARD_DRAFT_WORKFLOW_AVAILABILITY_EXPRESSION);
  });

  it('does not update the command menu item when the expression is already synced', () => {
    const syncedDiscardDraftWorkflowCommandMenuItem =
      buildDiscardDraftWorkflowCommandMenuItem({
        conditionalAvailabilityExpression:
          EXPECTED_DISCARD_DRAFT_WORKFLOW_AVAILABILITY_EXPRESSION,
      });

    const result =
      buildSyncDiscardDraftWorkflowAvailabilityExpressionSyncOperations({
        existingFlatCommandMenuItemMaps: buildFlatCommandMenuItemMaps([
          syncedDiscardDraftWorkflowCommandMenuItem,
        ]),
        now: NOW,
      });

    expect(result.flatEntityToUpdate).toHaveLength(0);
  });

  it('does not update an unrelated custom availability expression', () => {
    const customDiscardDraftWorkflowCommandMenuItem =
      buildDiscardDraftWorkflowCommandMenuItem({
        conditionalAvailabilityExpression:
          'everyEquals(selectedRecords, "currentVersion.status", "DRAFT")',
      });

    const result =
      buildSyncDiscardDraftWorkflowAvailabilityExpressionSyncOperations({
        existingFlatCommandMenuItemMaps: buildFlatCommandMenuItemMaps([
          customDiscardDraftWorkflowCommandMenuItem,
        ]),
        now: NOW,
      });

    expect(result.flatEntityToUpdate).toHaveLength(0);
  });

  it('does not update when the discard draft workflow command menu item is missing', () => {
    const result =
      buildSyncDiscardDraftWorkflowAvailabilityExpressionSyncOperations({
        existingFlatCommandMenuItemMaps: buildFlatCommandMenuItemMaps([]),
        now: NOW,
      });

    expect(result).toEqual({
      flatEntityToCreate: [],
      flatEntityToDelete: [],
      flatEntityToUpdate: [],
    });
  });
});
