import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { CommandMenuItemAvailabilityType } from 'twenty-shared/types';

import {
  buildSettingsGoToCommandLabelUpdates,
  SETTINGS_GO_TO_COMMAND_LABEL_RENAMES,
} from 'src/database/commands/upgrade-version-command/2-65/utils/build-settings-go-to-command-label-updates.util';
import { EngineComponentKey } from 'src/engine/metadata-modules/command-menu-item/enums/engine-component-key.enum';
import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { STANDARD_COMMAND_MENU_ITEMS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-command-menu-item.constant';

const NOW = '2026-11-26T00:00:00.000Z';

const EXPERIENCE_UNIVERSAL_IDENTIFIER =
  STANDARD_COMMAND_MENU_ITEMS.goToSettingsExperience.universalIdentifier;

const EXPERIENCE_COMMAND_MENU_ITEM: FlatCommandMenuItem = {
  workspaceId: '20202020-1111-4111-8111-111111111111',
  applicationId: '20202020-2222-4222-8222-222222222222',
  applicationUniversalIdentifier:
    TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
  id: 'experience-command-id',
  universalIdentifier: EXPERIENCE_UNIVERSAL_IDENTIFIER,
  label: 'Go to Experience Settings',
  shortLabel: 'Experience',
  icon: 'IconColorSwatch',
  position: 48,
  isPinned: false,
  isActive: true,
  isSystemSideEffect: false,
  engineComponentKey: EngineComponentKey.NAVIGATION,
  availabilityType: CommandMenuItemAvailabilityType.GLOBAL,
  conditionalAvailabilityExpression: null,
  conditionalPinnedExpression: null,
  availabilityCoreObjectName: null,
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
  payload: { path: '/settings/experience' },
  overrides: null,
  universalOverrides: null,
};

const buildItem = (
  overrides: Partial<FlatCommandMenuItem>,
): FlatCommandMenuItem => ({ ...EXPERIENCE_COMMAND_MENU_ITEM, ...overrides });

describe('buildSettingsGoToCommandLabelUpdates', () => {
  it('renames the former settings Go to label', () => {
    expect(
      buildSettingsGoToCommandLabelUpdates({
        flatCommandMenuItemByUniversalIdentifier: {
          [EXPERIENCE_UNIVERSAL_IDENTIFIER]: buildItem({}),
        },
        now: NOW,
      }),
    ).toEqual([
      expect.objectContaining({
        label: 'Go to Experience',
        shortLabel: 'Experience',
        updatedAt: NOW,
      }),
    ]);
  });

  it.each([
    { variant: 'a customized label', label: 'Open experience' },
    { variant: 'an already renamed label', label: 'Go to Experience' },
  ])('keeps $variant', ({ label }) => {
    expect(
      buildSettingsGoToCommandLabelUpdates({
        flatCommandMenuItemByUniversalIdentifier: {
          [EXPERIENCE_UNIVERSAL_IDENTIFIER]: buildItem({ label }),
        },
        now: NOW,
      }),
    ).toEqual([]);
  });

  it('ignores an item owned by another application', () => {
    expect(
      buildSettingsGoToCommandLabelUpdates({
        flatCommandMenuItemByUniversalIdentifier: {
          [EXPERIENCE_UNIVERSAL_IDENTIFIER]: buildItem({
            applicationUniversalIdentifier: 'another-application',
          }),
        },
        now: NOW,
      }),
    ).toEqual([]);
  });

  it('targets the current standard settings Go to commands', () => {
    const standardCommandMenuItems = Object.values(STANDARD_COMMAND_MENU_ITEMS);

    SETTINGS_GO_TO_COMMAND_LABEL_RENAMES.forEach(
      ({ universalIdentifier, currentLabel }) => {
        expect(
          standardCommandMenuItems.find(
            (item) => item.universalIdentifier === universalIdentifier,
          )?.label,
        ).toBe(currentLabel);
      },
    );
  });
});
