import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { CommandMenuItemAvailabilityType } from 'twenty-shared/types';

import {
  buildTidyUpWorkflowManualLayoutUpdate,
  MANUAL_LAYOUT_TIDY_UP_WORKFLOW_AVAILABILITY_EXPRESSION,
  PREVIOUS_TIDY_UP_WORKFLOW_AVAILABILITY_EXPRESSION,
  TIDY_UP_WORKFLOW_UNIVERSAL_IDENTIFIER,
} from 'src/database/commands/upgrade-version-command/2-58/utils/build-tidy-up-workflow-manual-layout-update.util';
import { EngineComponentKey } from 'src/engine/metadata-modules/command-menu-item/enums/engine-component-key.enum';
import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { STANDARD_COMMAND_MENU_ITEMS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-command-menu-item.constant';

const NOW = '2026-11-10T12:00:00.000Z';
const CREATED_AT = '2026-01-01T00:00:00.000Z';

const TIDY_UP_COMMAND_MENU_ITEM: FlatCommandMenuItem = {
  workspaceId: '20202020-1111-4111-8111-111111111111',
  applicationId: '20202020-2222-4222-8222-222222222222',
  applicationUniversalIdentifier:
    TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
  createdAt: CREATED_AT,
  updatedAt: CREATED_AT,
  id: 'tidy-up-command-id',
  universalIdentifier: TIDY_UP_WORKFLOW_UNIVERSAL_IDENTIFIER,
  label: 'Tidy up Workflow',
  shortLabel: 'Tidy up',
  icon: 'IconReorder',
  position: 31,
  isPinned: false,
  isActive: true,
  isSystemSideEffect: false,
  engineComponentKey: EngineComponentKey.TIDY_UP_WORKFLOW,
  availabilityType: CommandMenuItemAvailabilityType.RECORD_SELECTION,
  conditionalAvailabilityExpression:
    PREVIOUS_TIDY_UP_WORKFLOW_AVAILABILITY_EXPRESSION,
  conditionalPinnedExpression: null,
  availabilityCoreObjectName: 'workflow',
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

describe('buildTidyUpWorkflowManualLayoutUpdate', () => {
  it('should produce the standard tidy up workflow command', () => {
    expect(STANDARD_COMMAND_MENU_ITEMS.tidyUpWorkflow).toMatchObject({
      universalIdentifier: TIDY_UP_WORKFLOW_UNIVERSAL_IDENTIFIER,
      conditionalAvailabilityExpression:
        MANUAL_LAYOUT_TIDY_UP_WORKFLOW_AVAILABILITY_EXPRESSION,
      isPinned: true,
      shortLabel: null,
    });
  });

  it('should pin the command and restrict it to manual layouts', () => {
    expect(
      buildTidyUpWorkflowManualLayoutUpdate({
        flatCommandMenuItemMaps: buildMaps(TIDY_UP_COMMAND_MENU_ITEM),
        now: NOW,
      }),
    ).toEqual({
      ...TIDY_UP_COMMAND_MENU_ITEM,
      conditionalAvailabilityExpression:
        MANUAL_LAYOUT_TIDY_UP_WORKFLOW_AVAILABILITY_EXPRESSION,
      isPinned: true,
      shortLabel: null,
      updatedAt: NOW,
    });
  });

  it('should skip an item already updated', () => {
    expect(
      buildTidyUpWorkflowManualLayoutUpdate({
        flatCommandMenuItemMaps: buildMaps({
          ...TIDY_UP_COMMAND_MENU_ITEM,
          conditionalAvailabilityExpression:
            MANUAL_LAYOUT_TIDY_UP_WORKFLOW_AVAILABILITY_EXPRESSION,
        }),
        now: NOW,
      }),
    ).toBeUndefined();
  });

  it('should skip an item with an unexpected expression', () => {
    expect(
      buildTidyUpWorkflowManualLayoutUpdate({
        flatCommandMenuItemMaps: buildMaps({
          ...TIDY_UP_COMMAND_MENU_ITEM,
          conditionalAvailabilityExpression: 'pageType == "RECORD_PAGE"',
        }),
        now: NOW,
      }),
    ).toBeUndefined();
  });

  it('should skip an item not owned by the standard application', () => {
    expect(
      buildTidyUpWorkflowManualLayoutUpdate({
        flatCommandMenuItemMaps: buildMaps({
          ...TIDY_UP_COMMAND_MENU_ITEM,
          applicationUniversalIdentifier:
            '20202020-3333-4333-8333-333333333333',
        }),
        now: NOW,
      }),
    ).toBeUndefined();
  });
});
