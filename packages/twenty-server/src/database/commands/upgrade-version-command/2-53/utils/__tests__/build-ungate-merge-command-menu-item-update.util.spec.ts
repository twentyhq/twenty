import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { CommandMenuItemAvailabilityType } from 'twenty-shared/types';

import {
  buildUngateMergeCommandMenuItemUpdate,
  GATED_MERGE_AVAILABILITY_EXPRESSION,
  MERGE_MULTIPLE_RECORDS_UNIVERSAL_IDENTIFIER,
  UNGATED_MERGE_AVAILABILITY_EXPRESSION,
} from 'src/database/commands/upgrade-version-command/2-53/utils/build-ungate-merge-command-menu-item-update.util';
import { EngineComponentKey } from 'src/engine/metadata-modules/command-menu-item/enums/engine-component-key.enum';
import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { STANDARD_COMMAND_MENU_ITEMS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-command-menu-item.constant';

const NOW = '2026-10-27T12:00:00.000Z';
const CREATED_AT = '2026-01-01T00:00:00.000Z';

const MERGE_COMMAND_MENU_ITEM: FlatCommandMenuItem = {
  workspaceId: '20202020-1111-4111-8111-111111111111',
  applicationId: '20202020-2222-4222-8222-222222222222',
  applicationUniversalIdentifier:
    TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
  createdAt: CREATED_AT,
  updatedAt: CREATED_AT,
  id: 'merge-command-id',
  universalIdentifier: MERGE_MULTIPLE_RECORDS_UNIVERSAL_IDENTIFIER,
  label: 'Merge {objectLabelPlural}',
  shortLabel: 'Merge',
  icon: 'IconArrowMerge',
  position: 12,
  isPinned: false,
  isActive: true,
  isSystemSideEffect: false,
  engineComponentKey: EngineComponentKey.MERGE_MULTIPLE_RECORDS,
  availabilityType: CommandMenuItemAvailabilityType.RECORD_SELECTION,
  conditionalAvailabilityExpression: GATED_MERGE_AVAILABILITY_EXPRESSION,
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
  byUniversalIdentifier: {
    [commandMenuItem.universalIdentifier]: commandMenuItem,
  },
});

describe('buildUngateMergeCommandMenuItemUpdate', () => {
  // The later record-permission command extends this expression, so only the target is shared with the constant
  it('should target the standard merge command', () => {
    expect(STANDARD_COMMAND_MENU_ITEMS.mergeMultipleRecords).toMatchObject({
      universalIdentifier: MERGE_MULTIPLE_RECORDS_UNIVERSAL_IDENTIFIER,
    });
  });

  it('should drop the duplicate criteria condition on up', () => {
    expect(
      buildUngateMergeCommandMenuItemUpdate({
        flatCommandMenuItemMaps: buildMaps(MERGE_COMMAND_MENU_ITEM),
        direction: 'up',
        now: NOW,
      }),
    ).toEqual({
      ...MERGE_COMMAND_MENU_ITEM,
      conditionalAvailabilityExpression: UNGATED_MERGE_AVAILABILITY_EXPRESSION,
      updatedAt: NOW,
    });
  });

  it('should restore the duplicate criteria condition on down', () => {
    expect(
      buildUngateMergeCommandMenuItemUpdate({
        flatCommandMenuItemMaps: buildMaps({
          ...MERGE_COMMAND_MENU_ITEM,
          conditionalAvailabilityExpression:
            UNGATED_MERGE_AVAILABILITY_EXPRESSION,
        }),
        direction: 'down',
        now: NOW,
      })?.conditionalAvailabilityExpression,
    ).toBe(GATED_MERGE_AVAILABILITY_EXPRESSION);
  });

  it('should skip an item already updated', () => {
    expect(
      buildUngateMergeCommandMenuItemUpdate({
        flatCommandMenuItemMaps: buildMaps({
          ...MERGE_COMMAND_MENU_ITEM,
          conditionalAvailabilityExpression:
            UNGATED_MERGE_AVAILABILITY_EXPRESSION,
        }),
        direction: 'up',
        now: NOW,
      }),
    ).toBeUndefined();
  });

  it('should skip an item with an unexpected expression', () => {
    expect(
      buildUngateMergeCommandMenuItemUpdate({
        flatCommandMenuItemMaps: buildMaps({
          ...MERGE_COMMAND_MENU_ITEM,
          conditionalAvailabilityExpression: 'numberOfSelectedRecords >= 2',
        }),
        direction: 'up',
        now: NOW,
      }),
    ).toBeUndefined();
  });

  it('should skip an item not owned by the standard application', () => {
    expect(
      buildUngateMergeCommandMenuItemUpdate({
        flatCommandMenuItemMaps: buildMaps({
          ...MERGE_COMMAND_MENU_ITEM,
          applicationUniversalIdentifier:
            '20202020-3333-4333-8333-333333333333',
        }),
        direction: 'up',
        now: NOW,
      }),
    ).toBeUndefined();
  });
});
