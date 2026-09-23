import { SettingsMenuItemScope } from '~/generated-metadata/graphql';
import { getWorkspaceSettingsMenuItems } from '~/pages/settings/applications/utils/getWorkspaceSettingsMenuItems';

const buildSettingsMenuItem = ({
  universalIdentifier,
  position,
  scope = SettingsMenuItemScope.WORKSPACE,
}: {
  universalIdentifier: string;
  position: number;
  scope?: SettingsMenuItemScope;
}) => ({ universalIdentifier, position, scope });

describe('getWorkspaceSettingsMenuItems', () => {
  it('should order items by ascending position', () => {
    const result = getWorkspaceSettingsMenuItems([
      buildSettingsMenuItem({ universalIdentifier: 'c', position: 3 }),
      buildSettingsMenuItem({ universalIdentifier: 'a', position: 1 }),
      buildSettingsMenuItem({ universalIdentifier: 'b', position: 1.5 }),
    ]);

    expect(result.map((item) => item.universalIdentifier)).toEqual([
      'a',
      'b',
      'c',
    ]);
  });

  it('should break a shared position on universalIdentifier', () => {
    const result = getWorkspaceSettingsMenuItems([
      buildSettingsMenuItem({ universalIdentifier: 'b', position: 1 }),
      buildSettingsMenuItem({ universalIdentifier: 'a', position: 1 }),
    ]);

    expect(result.map((item) => item.universalIdentifier)).toEqual(['a', 'b']);
  });

  it('should leave out user-scoped items', () => {
    const result = getWorkspaceSettingsMenuItems([
      buildSettingsMenuItem({
        universalIdentifier: 'user-item',
        position: 1,
        scope: SettingsMenuItemScope.USER,
      }),
      buildSettingsMenuItem({
        universalIdentifier: 'workspace-item',
        position: 2,
      }),
    ]);

    expect(result.map((item) => item.universalIdentifier)).toEqual([
      'workspace-item',
    ]);
  });

  it('should not mutate the items it was given', () => {
    const settingsMenuItems = [
      buildSettingsMenuItem({ universalIdentifier: 'b', position: 2 }),
      buildSettingsMenuItem({ universalIdentifier: 'a', position: 1 }),
    ];

    getWorkspaceSettingsMenuItems(settingsMenuItems);

    expect(settingsMenuItems.map((item) => item.universalIdentifier)).toEqual([
      'b',
      'a',
    ]);
  });
});
