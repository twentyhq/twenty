import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { CommandMenuItemAvailabilityType } from 'twenty-shared/types';

import { UNGATED_MERGE_AVAILABILITY_EXPRESSION } from 'src/database/commands/upgrade-version-command/2-53/utils/build-ungate-merge-command-menu-item-update.util';
import { buildMergeCommandRecordPermissionAvailabilityUpdates } from 'src/database/commands/upgrade-version-command/2-53/utils/build-merge-command-record-permission-availability-updates.util';
import { EngineComponentKey } from 'src/engine/metadata-modules/command-menu-item/enums/engine-component-key.enum';
import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { STANDARD_COMMAND_MENU_ITEMS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-command-menu-item.constant';

const NOW = '2026-10-27T12:00:00.000Z';
const MERGE_UNIVERSAL_IDENTIFIER =
  STANDARD_COMMAND_MENU_ITEMS.mergeMultipleRecords.universalIdentifier;
const PREVIOUS_EXPRESSION = UNGATED_MERGE_AVAILABILITY_EXPRESSION;
const CURRENT_EXPRESSION =
  STANDARD_COMMAND_MENU_ITEMS.mergeMultipleRecords
    .conditionalAvailabilityExpression;

const MERGE_COMMAND: FlatCommandMenuItem = {
  workspaceId: '20202020-1111-4111-8111-111111111111',
  applicationId: '20202020-2222-4222-8222-222222222222',
  applicationUniversalIdentifier:
    TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
  createdAt: '2026-10-21T12:00:00.000Z',
  updatedAt: '2026-10-21T12:00:00.000Z',
  id: 'merge-id',
  universalIdentifier: MERGE_UNIVERSAL_IDENTIFIER,
  label: 'Merge records',
  shortLabel: 'Merge',
  icon: 'IconArrowMerge',
  position: 12,
  isPinned: false,
  isActive: true,
  isSystemSideEffect: false,
  engineComponentKey: EngineComponentKey.MERGE_MULTIPLE_RECORDS,
  availabilityType: CommandMenuItemAvailabilityType.RECORD_SELECTION,
  conditionalAvailabilityExpression: PREVIOUS_EXPRESSION,
  conditionalPinnedExpression: null,
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
};

const buildMaps = (
  commandMenuItem: FlatCommandMenuItem,
): FlatEntityMaps<FlatCommandMenuItem> => ({
  ...createEmptyFlatEntityMaps(),
  byUniversalIdentifier: { [MERGE_UNIVERSAL_IDENTIFIER]: commandMenuItem },
});

describe('buildMergeCommandRecordPermissionAvailabilityUpdates', () => {
  it('should require record permissions on upgrade, matching the standard definition', () => {
    const updates = buildMergeCommandRecordPermissionAvailabilityUpdates({
      flatCommandMenuItemMaps: buildMaps(MERGE_COMMAND),
      direction: 'up',
      now: NOW,
    });

    expect(updates).toEqual([
      {
        ...MERGE_COMMAND,
        conditionalAvailabilityExpression: CURRENT_EXPRESSION,
        updatedAt: NOW,
      },
    ]);
  });

  it('should restore the previous expression on downgrade', () => {
    const updates = buildMergeCommandRecordPermissionAvailabilityUpdates({
      flatCommandMenuItemMaps: buildMaps({
        ...MERGE_COMMAND,
        conditionalAvailabilityExpression: CURRENT_EXPRESSION,
      }),
      direction: 'down',
      now: NOW,
    });

    expect(updates).toEqual([
      {
        ...MERGE_COMMAND,
        conditionalAvailabilityExpression: PREVIOUS_EXPRESSION,
        updatedAt: NOW,
      },
    ]);
  });

  it('should be a no-op once already upgraded', () => {
    const updates = buildMergeCommandRecordPermissionAvailabilityUpdates({
      flatCommandMenuItemMaps: buildMaps({
        ...MERGE_COMMAND,
        conditionalAvailabilityExpression: CURRENT_EXPRESSION,
      }),
      direction: 'up',
      now: NOW,
    });

    expect(updates).toEqual([]);
  });

  it('should leave a customized expression untouched', () => {
    const updates = buildMergeCommandRecordPermissionAvailabilityUpdates({
      flatCommandMenuItemMaps: buildMaps({
        ...MERGE_COMMAND,
        conditionalAvailabilityExpression: 'numberOfSelectedRecords >= 2',
      }),
      direction: 'up',
      now: NOW,
    });

    expect(updates).toEqual([]);
  });
});
