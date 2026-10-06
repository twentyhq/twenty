import { type AppPreferencesApplication } from '@/settings/app-preferences/types/AppPreferencesApplication';
import { getApplicationUserSettingsMenuItems } from '@/settings/app-preferences/utils/getApplicationUserSettingsMenuItems';
import { SettingsMenuItemScope } from '~/generated-metadata/graphql';

const buildSettingsMenuItem = ({
  applicationId,
  universalIdentifier,
  position,
  scope,
}: {
  applicationId: string;
  universalIdentifier: string;
  position: number;
  scope: SettingsMenuItemScope;
}) => ({
  id: `${applicationId}-${universalIdentifier}`,
  universalIdentifier,
  applicationId,
  frontComponentId: `front-component-${universalIdentifier}`,
  title: universalIdentifier,
  icon: null,
  position,
  scope,
});

const buildApplication = (
  id: string,
  name: string,
  settingsMenuItems: AppPreferencesApplication['settingsMenuItems'],
): AppPreferencesApplication => ({
  id,
  name,
  logoUrl: null,
  settingsMenuItems,
});

describe('getApplicationUserSettingsMenuItems', () => {
  it('should keep only user-scoped items, in application name then position order', () => {
    const result = getApplicationUserSettingsMenuItems([
      buildApplication('zapier', 'Zapier', [
        buildSettingsMenuItem({
          applicationId: 'zapier',
          universalIdentifier: 'zapier-user',
          position: 0,
          scope: SettingsMenuItemScope.USER,
        }),
      ]),
      buildApplication('fathom', 'Fathom', [
        buildSettingsMenuItem({
          applicationId: 'fathom',
          universalIdentifier: 'fathom-second',
          position: 2,
          scope: SettingsMenuItemScope.USER,
        }),
        buildSettingsMenuItem({
          applicationId: 'fathom',
          universalIdentifier: 'fathom-workspace',
          position: 0,
          scope: SettingsMenuItemScope.WORKSPACE,
        }),
        buildSettingsMenuItem({
          applicationId: 'fathom',
          universalIdentifier: 'fathom-first',
          position: 1,
          scope: SettingsMenuItemScope.USER,
        }),
      ]),
    ]);

    expect(
      result.map(({ application, settingsMenuItem }) => [
        application.name,
        settingsMenuItem.universalIdentifier,
      ]),
    ).toEqual([
      ['Fathom', 'fathom-first'],
      ['Fathom', 'fathom-second'],
      ['Zapier', 'zapier-user'],
    ]);
  });

  it('should strip the settings menu items from the application it returns', () => {
    const [result] = getApplicationUserSettingsMenuItems([
      buildApplication('fathom', 'Fathom', [
        buildSettingsMenuItem({
          applicationId: 'fathom',
          universalIdentifier: 'fathom-user',
          position: 0,
          scope: SettingsMenuItemScope.USER,
        }),
      ]),
    ]);

    expect(result.application).toEqual({
      id: 'fathom',
      name: 'Fathom',
      logoUrl: null,
    });
  });

  it('should return nothing for applications without settings menu items', () => {
    expect(
      getApplicationUserSettingsMenuItems([
        buildApplication('fathom', 'Fathom', null),
      ]),
    ).toEqual([]);
  });
});
