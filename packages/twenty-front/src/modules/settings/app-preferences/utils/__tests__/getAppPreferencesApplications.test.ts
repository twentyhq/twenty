import { type AppPreferencesApplication } from '@/settings/app-preferences/types/AppPreferencesApplication';
import { getAppPreferencesApplications } from '@/settings/app-preferences/utils/getAppPreferencesApplications';
import { SettingsMenuItemScope } from '~/generated-metadata/graphql';

const buildSettingsMenuItem = (
  applicationId: string,
  scope: SettingsMenuItemScope,
) => ({
  id: `${applicationId}-${scope}`,
  universalIdentifier: `${applicationId}-${scope}`,
  applicationId,
  frontComponentId: `front-component-${applicationId}`,
  title: applicationId,
  icon: null,
  position: 0,
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

describe('getAppPreferencesApplications', () => {
  it('should keep applications with user settings or a connected account, by name', () => {
    const result = getAppPreferencesApplications(
      [
        buildApplication('zapier', 'Zapier', [
          buildSettingsMenuItem('zapier', SettingsMenuItemScope.USER),
        ]),
        buildApplication('slack', 'Slack', [
          buildSettingsMenuItem('slack', SettingsMenuItemScope.WORKSPACE),
        ]),
        buildApplication('fathom', 'Fathom', null),
        buildApplication('linear', 'Linear', []),
      ],
      [{ applicationId: 'fathom' }, { applicationId: null }],
    );

    expect(result.map(({ id }) => id)).toEqual(['fathom', 'zapier']);
  });

  it('should return nothing when no application is relevant to the member', () => {
    expect(
      getAppPreferencesApplications(
        [buildApplication('slack', 'Slack', [])],
        [],
      ),
    ).toEqual([]);
  });
});
