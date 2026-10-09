import { getSettingsMenuItemsForScope } from '@/settings/applications/utils/getSettingsMenuItemsForScope';
import { SettingsMenuItemScope } from '~/generated-metadata/graphql';

const buildSettingsMenuItem = ({
  universalIdentifier,
  position,
  scope = SettingsMenuItemScope.WORKSPACE,
}: {
  universalIdentifier: string;
  position: number;
  scope?: SettingsMenuItemScope;
}) => ({ universalIdentifier, position, scope });

describe('getSettingsMenuItemsForScope', () => {
  it('should order items by ascending position', () => {
    const result = getSettingsMenuItemsForScope({
      settingsMenuItems: [
        buildSettingsMenuItem({ universalIdentifier: 'c', position: 3 }),
        buildSettingsMenuItem({ universalIdentifier: 'a', position: 1 }),
        buildSettingsMenuItem({ universalIdentifier: 'b', position: 1.5 }),
      ],
      scope: SettingsMenuItemScope.WORKSPACE,
    });

    expect(result.map((item) => item.universalIdentifier)).toEqual([
      'a',
      'b',
      'c',
    ]);
  });

  it('should break a shared position on universalIdentifier', () => {
    const result = getSettingsMenuItemsForScope({
      settingsMenuItems: [
        buildSettingsMenuItem({ universalIdentifier: 'b', position: 1 }),
        buildSettingsMenuItem({ universalIdentifier: 'a', position: 1 }),
      ],
      scope: SettingsMenuItemScope.WORKSPACE,
    });

    expect(result.map((item) => item.universalIdentifier)).toEqual(['a', 'b']);
  });

  it('should leave out user-scoped items for the workspace scope', () => {
    const result = getSettingsMenuItemsForScope({
      settingsMenuItems: [
        buildSettingsMenuItem({
          universalIdentifier: 'user-item',
          position: 1,
          scope: SettingsMenuItemScope.USER,
        }),
        buildSettingsMenuItem({
          universalIdentifier: 'workspace-item',
          position: 2,
        }),
      ],
      scope: SettingsMenuItemScope.WORKSPACE,
    });

    expect(result.map((item) => item.universalIdentifier)).toEqual([
      'workspace-item',
    ]);
  });

  it('should keep only user-scoped items, in order, for the user scope', () => {
    const result = getSettingsMenuItemsForScope({
      settingsMenuItems: [
        buildSettingsMenuItem({
          universalIdentifier: 'workspace-item',
          position: 0,
        }),
        buildSettingsMenuItem({
          universalIdentifier: 'second-user-item',
          position: 2,
          scope: SettingsMenuItemScope.USER,
        }),
        buildSettingsMenuItem({
          universalIdentifier: 'first-user-item',
          position: 1,
          scope: SettingsMenuItemScope.USER,
        }),
      ],
      scope: SettingsMenuItemScope.USER,
    });

    expect(result.map((item) => item.universalIdentifier)).toEqual([
      'first-user-item',
      'second-user-item',
    ]);
  });

  it('should not mutate the items it was given', () => {
    const settingsMenuItems = [
      buildSettingsMenuItem({ universalIdentifier: 'b', position: 2 }),
      buildSettingsMenuItem({ universalIdentifier: 'a', position: 1 }),
    ];

    getSettingsMenuItemsForScope({
      settingsMenuItems,
      scope: SettingsMenuItemScope.WORKSPACE,
    });

    expect(settingsMenuItems.map((item) => item.universalIdentifier)).toEqual([
      'b',
      'a',
    ]);
  });
});
