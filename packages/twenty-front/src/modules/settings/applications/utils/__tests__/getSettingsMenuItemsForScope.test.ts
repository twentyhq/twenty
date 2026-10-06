import { SettingsMenuItemScope } from '~/generated-metadata/graphql';
import { getSettingsMenuItemsForScope } from '@/settings/applications/utils/getSettingsMenuItemsForScope';

const buildSettingsMenuItem = ({
  universalIdentifier,
  position,
  scope,
}: {
  universalIdentifier: string;
  position: number;
  scope: SettingsMenuItemScope;
}) => ({ universalIdentifier, position, scope });

describe('getSettingsMenuItemsForScope', () => {
  it('should keep only the items of the requested scope', () => {
    const result = getSettingsMenuItemsForScope(
      [
        buildSettingsMenuItem({
          universalIdentifier: 'workspace-item',
          position: 1,
          scope: SettingsMenuItemScope.WORKSPACE,
        }),
        buildSettingsMenuItem({
          universalIdentifier: 'user-item',
          position: 2,
          scope: SettingsMenuItemScope.USER,
        }),
      ],
      SettingsMenuItemScope.USER,
    );

    expect(result.map((item) => item.universalIdentifier)).toEqual([
      'user-item',
    ]);
  });

  it('should order items by ascending position, then universalIdentifier', () => {
    const result = getSettingsMenuItemsForScope(
      [
        buildSettingsMenuItem({
          universalIdentifier: 'c',
          position: 3,
          scope: SettingsMenuItemScope.USER,
        }),
        buildSettingsMenuItem({
          universalIdentifier: 'b',
          position: 1,
          scope: SettingsMenuItemScope.USER,
        }),
        buildSettingsMenuItem({
          universalIdentifier: 'a',
          position: 1,
          scope: SettingsMenuItemScope.USER,
        }),
      ],
      SettingsMenuItemScope.USER,
    );

    expect(result.map((item) => item.universalIdentifier)).toEqual([
      'a',
      'b',
      'c',
    ]);
  });

  it('should not mutate the items it was given', () => {
    const settingsMenuItems = [
      buildSettingsMenuItem({
        universalIdentifier: 'b',
        position: 2,
        scope: SettingsMenuItemScope.USER,
      }),
      buildSettingsMenuItem({
        universalIdentifier: 'a',
        position: 1,
        scope: SettingsMenuItemScope.USER,
      }),
    ];

    getSettingsMenuItemsForScope(settingsMenuItems, SettingsMenuItemScope.USER);

    expect(settingsMenuItems.map((item) => item.universalIdentifier)).toEqual([
      'b',
      'a',
    ]);
  });
});
