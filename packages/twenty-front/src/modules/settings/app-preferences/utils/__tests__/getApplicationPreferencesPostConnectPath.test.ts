import { getApplicationPreferencesPostConnectPath } from '@/settings/app-preferences/utils/getApplicationPreferencesPostConnectPath';
import { SettingsMenuItemScope } from '~/generated-metadata/graphql';

const APPLICATION_ID = '0f1e2d3c-4b5a-4968-8776-655443322110';

const buildSettingsMenuItem = ({
  universalIdentifier,
  position,
  scope = SettingsMenuItemScope.USER,
  slug = null,
}: {
  universalIdentifier: string;
  position: number;
  scope?: SettingsMenuItemScope;
  slug?: string | null;
}) => ({ universalIdentifier, position, scope, slug });

describe('getApplicationPreferencesPostConnectPath', () => {
  it('should land on the general tab when the application has no user settings item', () => {
    expect(
      getApplicationPreferencesPostConnectPath({
        applicationId: APPLICATION_ID,
        settingsMenuItems: [
          buildSettingsMenuItem({
            universalIdentifier: 'workspace-settings',
            position: 0,
            scope: SettingsMenuItemScope.WORKSPACE,
          }),
        ],
      }),
    ).toBe(`/settings/app-preferences/${APPLICATION_ID}#general`);
  });

  it('should land on the first user settings item by position, using its slug', () => {
    expect(
      getApplicationPreferencesPostConnectPath({
        applicationId: APPLICATION_ID,
        settingsMenuItems: [
          buildSettingsMenuItem({ universalIdentifier: 'second', position: 2 }),
          buildSettingsMenuItem({
            universalIdentifier: 'workspace-settings',
            position: 0,
            scope: SettingsMenuItemScope.WORKSPACE,
            slug: 'workspace-sync',
          }),
          buildSettingsMenuItem({
            universalIdentifier: 'first',
            position: 1,
            slug: 'sync',
          }),
        ],
      }),
    ).toBe(`/settings/app-preferences/${APPLICATION_ID}#sync`);
  });

  it('should fall back to the universalIdentifier of an item without a slug', () => {
    expect(
      getApplicationPreferencesPostConnectPath({
        applicationId: APPLICATION_ID,
        settingsMenuItems: [
          buildSettingsMenuItem({ universalIdentifier: 'first', position: 1 }),
        ],
      }),
    ).toBe(`/settings/app-preferences/${APPLICATION_ID}#first`);
  });
});
