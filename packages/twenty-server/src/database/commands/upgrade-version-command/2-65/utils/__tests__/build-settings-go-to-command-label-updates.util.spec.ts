import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';

import {
  buildSettingsGoToCommandLabelUpdates,
  SETTINGS_GO_TO_COMMAND_LABEL_RENAMES,
} from 'src/database/commands/upgrade-version-command/2-65/utils/build-settings-go-to-command-label-updates.util';
import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { STANDARD_COMMAND_MENU_ITEMS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-command-menu-item.constant';

const NOW = '2026-11-26T00:00:00.000Z';

const EXPERIENCE_UNIVERSAL_IDENTIFIER =
  STANDARD_COMMAND_MENU_ITEMS.goToSettingsExperience.universalIdentifier;

const buildItem = (
  overrides: Partial<FlatCommandMenuItem>,
): FlatCommandMenuItem =>
  ({
    universalIdentifier: EXPERIENCE_UNIVERSAL_IDENTIFIER,
    applicationUniversalIdentifier:
      TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
    label: 'Go to Experience Settings',
    shortLabel: 'Experience',
    updatedAt: '2025-01-01T00:00:00.000Z',
    ...overrides,
  }) as FlatCommandMenuItem;

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
