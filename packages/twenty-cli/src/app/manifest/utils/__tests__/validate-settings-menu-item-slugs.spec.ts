import { describe, expect, it } from 'vitest';

import { type SettingsMenuItemManifest } from 'twenty-shared/application';

import { validateSettingsMenuItemSlugs } from '@/app/manifest/utils/validate-settings-menu-item-slugs';

const buildSettingsMenuItem = (
  overrides: Partial<SettingsMenuItemManifest>,
): SettingsMenuItemManifest => ({
  universalIdentifier: '6b4f0c43-6a0e-4d5b-9c62-8f1d1e5e2a01',
  frontComponentUniversalIdentifier: '6b4f0c43-6a0e-4d5b-9c62-8f1d1e5e2a02',
  title: 'Sync',
  ...overrides,
});

describe('validateSettingsMenuItemSlugs', () => {
  it('accepts distinct slugs and items without a slug', () => {
    expect(
      validateSettingsMenuItemSlugs({
        settingsMenuItems: [
          buildSettingsMenuItem({ slug: 'sync' }),
          buildSettingsMenuItem({ slug: 'billing', scope: 'USER' }),
          buildSettingsMenuItem({}),
          buildSettingsMenuItem({}),
        ],
      }),
    ).toEqual([]);
  });

  it('rejects a slug shared by two items, whatever their scope', () => {
    expect(
      validateSettingsMenuItemSlugs({
        settingsMenuItems: [
          buildSettingsMenuItem({ slug: 'sync', scope: 'WORKSPACE' }),
          buildSettingsMenuItem({ slug: 'sync', scope: 'USER' }),
        ],
      }),
    ).toEqual([
      'Settings menu item slug "sync" is used more than once. Slugs must be unique within an application.',
    ]);
  });
});
